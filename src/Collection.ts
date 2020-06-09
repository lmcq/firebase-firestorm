import { firestore } from 'firebase/app';
import store, { getRepository } from './store';
import { ICollectionQuery, ICollection, IDocumentRef, WriteTypes } from './types';
import { QueryBuilder, FirestoreSerializer } from './utils';
import DocumentRef from './fields/DocumentRef';
import Entity from './Entity';
import Query from './Query';

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
  private _native: firestore.CollectionReference;
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
  public constructor(E: new () => T, parent? : IDocumentRef<P>) {
    this._Entity = E;
    this._parent = parent || null;
    this._path = this.buildPath();
    this._native = this.buildNative();
  }

  /**
   * The path to this collection.
   */
  public get path(): string {
    return this._path;
  }

  /**
   * The parent document reference for the collection.
   */
  public get parent(): IDocumentRef<P> | null {
    return this._parent;
  }

  /**
   * The native firestore collection reference.
   */
  public get native(): firestore.CollectionReference {
    return this._native;
  }

  /**
   * @hidden
   * Creates the path to the collection.
   */
  private buildPath(): string {
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
  private buildNative(): firestore.CollectionReference {
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
  public doc(id: string): IDocumentRef<T> {
    return DocumentRef(id, this._Entity, this);
  }

  /**
   * Gets a document with a provided ID
   * @param id The ID of the document.
   * 
   * @returns The entity.
   */
  public get(id: string): Promise<T | null> {
    return new Promise((resolve): void => {
      this._native.doc(id).get().then((snapshot): void => {
        if (snapshot.exists) {
          resolve(FirestoreSerializer.deserialize(snapshot, this._Entity, this));
        }
        return resolve(null);
      });
    });
  }

  /**
   * Updates a document from an entity instance.
   * @param entity The entity (with ID) to update.
   * 
   * @returns The updated entity.
   */
  public update(entity: T): Promise<T | null> {
    return new Promise((resolve): void => {
      if (!entity.id) {
        throw new Error(`An ID must be provided when updating ${entity.constructor.name}`);
      }
      const { id, ...data } = FirestoreSerializer.serialize(entity, WriteTypes.Update);
      this._native.doc(id).update(data).then((): void => {
        this.get(entity.id).then((updatedEntity): void => {
          resolve(updatedEntity);
        });
      });
    });
  };

  /**
   * Creates a new document from an entity instance.
   * @param entity An instance of the entity.
   * 
   * @returns The created entity.
   */
  public create(entity: T): Promise<T | null> {
    return new Promise((resolve): void => {
      const { id, ...data } = FirestoreSerializer.serialize(entity, WriteTypes.Create);
      if (id) {
        this._native.doc(id).set(data).then((): void => {
          this.get(id).then((snapshot): void => {
            resolve(snapshot);
          });
        });
      } else {
        this._native.add(data).then((result): void => {
          this.get(result.id).then((snapshot): void => {
            resolve(snapshot);
          });
        });
      }
    });
  };

  /**
   * Finds a list of documents based on a criteria.
   * @param query The query parameters.
   * @deprecated since v1.1, use query() method to build queries instead.
   * @returns A list of entities matching the criteria.
   */
  public find(query? : ICollectionQuery<T>): Promise<T[]> {
    return new Promise((resolve): void => {
      let querySnapshotPromise: Promise<firestore.QuerySnapshot>;
      if (query) {
        const fields = getRepository(this._Entity.prototype.constructor.name).fields;
        querySnapshotPromise = QueryBuilder.query(this, fields, query).get();
      } else {
        querySnapshotPromise = this._native.get();
      }
      querySnapshotPromise.then((querySnapshot): void => {
        resolve(querySnapshot.docs.map((snapshot): T => {
          return FirestoreSerializer.deserialize(snapshot, this._Entity, this) as T;
        }));
      });
    });
  }

  /**
   * Removes a document from the collection.
   * @param id The document ID to remove.
   */
  public remove(id: string): Promise<void> {
    return new Promise((resolve): void => {
      this._native.doc(id).delete().then((): void => {
        resolve();
      });
    });
  }

  /**
   * Entry point for building queries.
   */
  public query(): Query<T> {
    return new Query(
      this._Entity,
      this,
      this._native,
    );
  }

}

/**
 * Collection factory
 * @returns A collection reference.
 */
export default <T extends Entity, P extends Entity> (
  model: new () => T,
  parent? : IDocumentRef<P>,
): ICollection<T, P> => new Collection<T, P>(model, parent);