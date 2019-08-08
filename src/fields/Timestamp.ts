import * as firestore from '@google-cloud/firestore';
import { ITimestamp } from '../types';

/**
 * Wrapper for firestore server timestamp, mainly used to keep
 * imports clean when using the library.
 */
export default class Timestamp implements ITimestamp {
  private _native : firestore.Timestamp;

  constructor(seconds: number, nanoseconds: number) {
    this._native = new firestore.Timestamp(seconds, nanoseconds);
  }

  public static fromDate(date : Date) {
    const native = firestore.Timestamp.fromDate(date);
    return new Timestamp(native.seconds, native.nanoseconds);
  }

  public static fromMillis(millis: number) {
    const native = firestore.Timestamp.fromMillis(millis);
    return new Timestamp(native.seconds, native.nanoseconds);
  }

  public get native() {
    return this._native;
  }

  public get nanoseconds() {
    return this._native.nanoseconds;
  }

  public get seconds() {
    return this._native.seconds;
  }

  public toDate() {
    return this._native.toDate();
  }

  public toMillis() {
    return this._native.toMillis();
  }

  public isEqual(other : ITimestamp) {
    return this._native.isEqual(other.native);
  }
}