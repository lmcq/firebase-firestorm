import { firestore } from 'firebase/app';
import { ITimestamp } from '../types';

/**
 * Wrapper for firestore server timestamp, mainly used to keep
 * imports clean when using the library.
 */
export default class Timestamp implements ITimestamp {
  private _native: firestore.Timestamp;

  public constructor(seconds: number, nanoseconds: number) {
    this._native = new firestore.Timestamp(seconds, nanoseconds);
  }

  public static fromDate(date: Date): Timestamp {
    const native = firestore.Timestamp.fromDate(date);
    return new Timestamp(native.seconds, native.nanoseconds);
  }

  public static fromMillis(millis: number): Timestamp {
    const native = firestore.Timestamp.fromMillis(millis);
    return new Timestamp(native.seconds, native.nanoseconds);
  }

  public get native(): firestore.Timestamp {
    return this._native;
  }

  public get nanoseconds(): number {
    return this._native.nanoseconds;
  }

  public get seconds(): number {
    return this._native.seconds;
  }

  public toDate(): Date {
    return this._native.toDate();
  }

  public toMillis(): number {
    return this._native.toMillis();
  }

  public isEqual(other: ITimestamp): boolean {
    return this._native.isEqual(other.native);
  }
}