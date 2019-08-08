import * as firestore from '@google-cloud/firestore';
import store, { getRepository } from './store';
import { ICollectionQuery, ICollection, IDocumentRef, WriteTypes } from './types';
import { QueryBuilder, FirestoreSerializer } from './utils';
import DocumentRef from './fields/DocumentRef';
import Entity from './Entity';

/**
 * Firestorm representation of a collection reference.
 * @typeparam T The entity for the collection documents.
 * @typeparam P The entity for the collection parent.
 */
class Collection <T extends Entity, P extends Entity> implements ICollection<T, P> {
  /**
   * @hidden
   */
  private _Entity: new () => T;
  /**
   * @hidden
   */
  private _native : firestore.CollectionReference;
  /**
   * @hidden
   */
  private _path: string;
  /**
   * @hidden
   */
  private _parent: IDocumentRef<P> | null;

  /**
   * Create a collection reference from an [[Entity]] and optional parent.
   * @param E The entity class for the collections documents. 
   * @param parent The parent document for the collection. 
   */
  constructor(E: new () => T, parent? : IDocumentRef<P>) {
    this._Entity = E;
    this._parent = parent || null;
    this._path = this.buildPath();
    this._native = this.buildNative();
  }

  /**
   * The path to this collection.
   */
  get path() {
    return this._path;
  }

  /**
   * The parent document reference for the collection.
   */
  get parent() {
    return this._parent;
  }

  /**
   * The native firestore collection reference.
   */
  get native() {
    return this._native;
  }

  /**
   * @hidden
   * Creates the path to the collection.
   */
  private buildPath() : string {
    const { name : collectionName } = getRepository(this._Entity.prototype.constructor.name).collectionConfig;
    let p = `/${collectionName}`;
    if (this._parent) {
     p = `${this._parent.path}${p}`;
    }
    return p;
  }

  /**
   * @hidden
   * Creates the native firestore reference.
   */
  private buildNative() : firestore.CollectionReference {
    const { firestore } = store();
    if (firestore) {
      return firestore.collection(this._path);
    } else {
      throw new Error('Undefined firestore');
    }
  };

  /**
   * Gets a document reference from the collection.
   * @param id The document ID.
   */
  public doc(id : string) : IDocumentRef<T> {
    return DocumentRef(id, this._Entity, this);
  }

  /**
   * Gets a document with a provided ID
   * @param id The ID of the document.
   * 
   * @returns The entity.
   */
  public async get(id: string): Promise<T | null> {
    const snapshot = await this._native.doc(id).get();
    if (snapshot.exists) {
      return FirestoreSerializer.deserialize(snapshot, this._Entity, this);
    }
    return null;
  }

  /**
   * Updates a document from an entity instance.
   * @param entity The entity (with ID) to update.
   * 
   * @returns The updated entity.
   */
  public async update(entity : T) : Promise<T | null> {
    if (!entity.id) {
      throw new Error(`An ID must be provided when updating ${entity.constructor.name}`);
    }
    const { id, ...data } = FirestoreSerializer.serialize(entity, WriteTypes.Update);
    await this._native.doc(id).update(data);
    return this.get(entity.id);
  };

  /**
   * Creates a new document from an entity instance.
   * @param entity An instance of the entity.
   * 
   * @returns The created entity.
   */
  public async create(entity : T) : Promise<T | null> {
    const { id, ...data } = FirestoreSerializer.serialize(entity, WriteTypes.Create);
    if (id) {
      await this._native.doc(id).set(data);
      return this.get(id);
    } else {
      const result = await this._native.add(data);
      return this.get(result.id);
    }
  };

  /**
   * Finds a list of documents based on a criteria.
   * @param query The query parameters.
   * 
   * @returns A list of entities matching the criteria.
   */
  public async find(query? : ICollectionQuery<T>) : Promise<T[]> {
    let querySnapshot : firestore.QuerySnapshot;
    if (query) {
      querySnapshot = await QueryBuilder.query(this, query).get();
    } else {
      querySnapshot = await this._native.get();
    }
    return querySnapshot.docs.map((snapshot) => {
      return FirestoreSerializer.deserialize(snapshot, this._Entity, this) as T;
    });
  }

  /**
   * Removes a document from the collection.
   * @param id The document ID to remove.
   */
  public async remove(id : string) : Promise<void> {
    await this._native.doc(id).delete();
  }
}

/**
 * Collection factory
 * @returns A collection reference.
 */
export default <T extends Entity, P extends Entity> (
  model: new () => T,
  parent? : IDocumentRef<P>,
) : ICollection<T, P> => new Collection<T, P>(model, parent);