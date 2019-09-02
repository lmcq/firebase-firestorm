import { firestore } from 'firebase/app';
import { Entity } from '.';
import { IFieldMeta, ICollection, IQuery } from './types';
import QuerySnapshot from './QuerySnapshot';

/**
 * Firestorm representation of a query. Queries can be chained
 * together, as per the standard firestore SDK.
 * @typeparam T The entity for the query.
 */
export default class Query<T extends Entity> implements IQuery<T> {
  private _Entity: new () => T;
  private _collection: ICollection<T>;
  private _native: firestore.Query;
  private _fields: Map<string, IFieldMeta>;

  /**
   * Create a collection query for an [[Entity]].
   * @param Entity T The entity to represent.
   * @param collection The collection to query.
   * @param fields The list of field for the collection.
   * @param native The native firestore query.
   */
  public constructor(
    Entity: new () => T,
    collection: ICollection<T>,
    fields: Map<string, IFieldMeta>,
    native: firestore.Query,
  ) {
    this._Entity = Entity;
    this._collection = collection;
    this._fields = fields;
    this._native = native;
  }

  /**
   * Applies a where filter to the query.
   * @param property The property to query.
   * @param op The operation to apply.
   * @param value The value to test for.
   */
  public where(property: keyof T, op: firestore.WhereFilterOp, value: any): Query<T> {
    const field = this._fields.get(property as string);
    if (field) {
      return this.appendNativeQuery(this._native.where(field.name, op, value));
    }
    throw new Error(`Could not find property in ${this._collection.path}`);
  }

  /**
   * Applies an order by filter to the query.
   * @param property The property to order by.
   * @param sort The order direction. Default value is ascending.
   */
  public orderBy(property: keyof T, sort?: firestore.OrderByDirection): Query<T> {
    const field = this._fields.get(property as string);
    if (field) {
      return this.appendNativeQuery(this._native.orderBy(field.name, sort));
    }
    throw new Error(`Could not find property in ${this._collection.path}`);
  }

  /**
   * Applies a limit filter to the query.
   * @param amount The maximum number of documents to return.
   */
  public limit(amount: number): Query<T> {
    return this.appendNativeQuery(this._native.limit(amount));
  }

  /**
   * Applies a start at filter to the query.
   * @param fieldValues The field values to start this query at, in order of the query's order by.
   */
  public startAt(...fieldValues: any[]): Query<T> {
    return this.appendNativeQuery(this._native.startAt(...fieldValues));
  }

  /**
   * Applies a start after filter to the query.
   * @param fieldValues The field values to start this query after, in order of the query's order by.
   */
  public startAfter(...fieldValues: any[]): Query<T> {
    return this.appendNativeQuery(this._native.startAfter(...fieldValues));
  }

  /**
   * Applies an end at filter to the query.
   * @param fieldValues The field values to end this query at, in order of the query's order by.
   */
  public endAt(...fieldValues: any[]): Query<T> {
    return this.appendNativeQuery(this._native.endAt(...fieldValues));
  }

  /**
   * Applies an end before filter to the query.
   * @param fieldValues The field values to end this query before, in order of the query's order by.
   */
  public endBefore(...fieldValues: any[]): Query<T> {
    return this.appendNativeQuery(this._native.endBefore(...fieldValues));
  }

  /**
   * Attaches a listener to the query.
   * @param onNext Callback which is called when new snapshot is available.
   * @param onError Callback which is called when an error occurs.
   * @returns An unsubscribe function.
   */
  public onSnapshot(
    onNext: (snapshot: QuerySnapshot<T>) => void, onError?: (error: Error) => void,
  ): (() => void) {
    return this._native.onSnapshot(
      (snapshot: firestore.QuerySnapshot): void => { onNext(this.buildSnapshot(snapshot)); },
      onError,
    );
  }

  public get(): Promise<QuerySnapshot<T>> {
    return new Promise((resolve): void => {
      this._native.get().then((snapshot): void => {
        resolve(this.buildSnapshot(snapshot));
      });
    });
  }

  /**
   * Appends a query to the current query.
   * @param query The query to append.
   */
  private appendNativeQuery(query: firestore.Query): Query<T> {
    return new Query(
      this._Entity,
      this._collection,
      this._fields,
      query,
    );
  }

  /**
   * Creates a firestorm snapshot from the firestore snapshot.
   * @param nativeSnapshot The native query document snapshot.
   */
  private buildSnapshot(nativeSnapshot: firestore.QuerySnapshot): QuerySnapshot<T> {
    return new QuerySnapshot(
      nativeSnapshot,
      this._Entity,
      this._collection,
      this,
    );
  }
}
