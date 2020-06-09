import { firestore } from './firestore';
import Query from './Query';
import Entity from './Entity';
import { IQuerySnapshot, ICollection, DocumentChange } from './types';
import { FirestoreSerializer } from './utils';

/**
 * A wrapper around the Firestore QuerySnapshot class.
 */
export default class QuerySnapshot <T extends Entity> implements IQuerySnapshot<T> {
  /**
   * @hidden
   */
  private _Entity: new () => T;
  /**
   * @hidden
   */
  private _collection: ICollection<T>;
  /**
   * @hidden
   */
  private _nativeSnapshot: firestore.QuerySnapshot;
  /**
   * @hidden
   */
  private _docs: T[];
  /**
   * @hidden
   */
  private _query: Query<T>;

  /**
   * Creates a query snapshot from firestore snapshot.
   * @param nativeSnapshot The native query snapshot.
   * @param Entity The entity to represention.
   * @param collection The collection for the entity.
   * @param query The query which was run. 
   */
  public constructor(
    nativeSnapshot: firestore.QuerySnapshot,
    Entity: new () => T,
    collection: ICollection<T>,
    query: Query<T>,
  ) {
    this._Entity = Entity;
    this._collection = collection;
    this._nativeSnapshot = nativeSnapshot;
    this._docs = nativeSnapshot.docs.map(this.deserializeValue);
    this._query = query;
  }

  /**
   * The docs in the snapshot.
   */
  public get docs(): T[] { return this._docs; }

  /**
   * The number of docs in the snapshot.
   */
  public get size(): number { return this._nativeSnapshot.size }

  /**
   * Whether or not the snapshot is empty.
   */
  public get empty(): boolean { return this._nativeSnapshot.size === 0; }

  /**
   * The snapshot metadata.
   */
  public get metadata(): firestore.SnapshotMetadata { return this._nativeSnapshot.metadata; }

  /**
   * The query which resulted in the snapshot.
   */
  public get query(): Query<T> { return this._query; }

  /**
   * Executes a callback function on the snapshot docs.
   * @param callback The function to run on each doc.
   */
  public forEach(callback: ((doc: T, index: number) => void)): void {
    this._docs.forEach(callback);
  }

  /**
   * Returns an array of the document changes since the last snapshot.
   * @param opts Options to control what type of changes to include in the results.
   */
  public docChanges(opts?: firestore.SnapshotListenOptions): DocumentChange<T>[] {
    const changes = this._nativeSnapshot.docChanges(opts).map((change): DocumentChange<T> => {
      const doc = this.deserializeValue(change.doc);
      return {
        doc,
        newIndex: change.newIndex,
        oldIndex: change.oldIndex,
        type: change.type,
      }
    });
    return changes;
  }

  /**
   * Helper function to deserialize snapshot value.
   * @hidden
   */
  private deserializeValue = (nativeValue: firestore.DocumentSnapshot): T  => {
    return FirestoreSerializer.deserialize(nativeValue, this._Entity, this._collection);
  }

}