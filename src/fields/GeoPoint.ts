import * as firestore from '@google-cloud/firestore';
import { IGeoPoint } from '../types';

/**
 * Wrapper for firestore geopoint class, mainly used to keep
 * imports clean when using the library.
 */
export default class GeoPoint implements IGeoPoint {
  private _native : firestore.GeoPoint;

  constructor(latitude: number, longitude: number) {
    this._native = new firestore.GeoPoint(latitude, longitude);
  }

  public get native() {
    return this._native;
  }

  public get latitude() {
    return this._native.latitude;
  }

  public set latitude(value : number) {
    this._native = new firestore.GeoPoint(value, this.longitude);
  }

  public get longitude() {
    return this._native.longitude;
  }

  public set longitude(value: number) {
    this._native = new firestore.GeoPoint(this.latitude, value);
  }

  public isEqual(other : IGeoPoint) {
    return this._native.isEqual(other.native);
  }
}