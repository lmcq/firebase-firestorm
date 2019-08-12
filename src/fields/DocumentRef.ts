import { IDocumentRef, ICollection } from '../types';
import * as firestore from '@google-cloud/firestore';
import { FirestoreSerializer } from '../utils';
import Collection from '../Collection';
import Entity from '../Entity';
import { getRepository } from '../store';

/**
 * Representation of a Document Reference
 * @typeparam T The entity for the document reference.
 */
class DocumentRef <T extends Entity> implements IDocumentRef<T> {
  private _id: string;
  private _model: new () => T;
  private _native: firestore.DocumentReference;
  private _path: string;
  private _parent: ICollection<T>;
  private _cachedDocument: T | null;

  /**
   * Create a document reference using a document ID,
   * entity and parent collection.
   * @param id The document ID.
   * @param model The entity class for the document.
   * @param parent The parent collection.
   */
  public constructor(
    id: string,
    model: new () => T,
    parent: ICollection<T>,
  ) {
    this._id = id;
    this._cachedDocument = null;
    this._model = model;
    this._parent = parent;
    this._path = this.buildPath();
    this._native = this.buildNative();
  }

  /**
   * Get the document ID.
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Get the cached document data.
   */
  public get cached(): T | null {
    if (!this._cachedDocument) {
      throw new Error('Can not fetch cached document reference, call get() first.');
    }
    return this._cachedDocument;
  }

  /**
   * Get the path to the document.
   */
  public get path(): string {
    return this._path;
  }

  /**
   * Get the parent collection.
   */
  public get parent(): ICollection<T> {
    return this._parent;
  }

  /**
   * Get the firestore document reference.
   */
  public get native(): firestore.DocumentReference {
    return this._native;
  }

  /**
   * Append the document ID to the path.
   */
  private buildPath(): string {
    return `${this._parent.path}/${this._id}`;
  }

  /**
   * Get the firestore document reference from the path.
   */
  private buildNative(): firestore.DocumentReference {
    return this._parent.native.doc(this._id);
  }

  /**
   * Gets the data from the document reference.
   */
  public get(): Promise<T> {
    return new Promise((resolve): void => {
      if (this._cachedDocument === null) {
        this._native.get().then((snapshot): void => {
          this._cachedDocument = FirestoreSerializer.deserialize(snapshot, this._model, this.parent); 
          resolve(this._cachedDocument);
        });
      } else {
        resolve(this._cachedDocument);
      }
    });
  }

  /**
   * Returns whether we have already fetched the document data.
   */
  public isFetched(): boolean {
    return this._cachedDocument !== null;
  }

  /**
   * Get a subcollection for a document.
   * @param collectionModel The entity for the collection.
   */
  public collection <C extends Entity> (collectionModel: new () => C): ICollection<C> {
    const childRepository = getRepository(collectionModel.prototype.constructor.name);
    const currentSubcollections = getRepository(this._model.prototype.constructor.name).subcollections;
    const collectionExists = currentSubcollections.has(childRepository.collectionConfig.name);
    if (collectionExists) {
      return Collection(collectionModel, this);
    }
    throw new Error(`Could not find collection ${collectionModel.prototype.constructor.name} in parent ${this._model.prototype.constructor.name}`);
  }
}

/**
 * DocumentRef Factory
 */
export default <T extends Entity> (
  id: string,
  model: new () => T,
  parent: ICollection<T>,
): IDocumentRef<T> => new DocumentRef(id, model, parent);

