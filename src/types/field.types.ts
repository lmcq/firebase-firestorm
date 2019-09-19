/* eslint-disable @typescript-eslint/no-empty-interface */
import { firestore } from 'firebase/app';
import { FieldTypes } from './enum.types';
import { ICollection, IEntity, IDocumentSnapshot } from './collection.types';

// Base Field Config

export interface IFieldConfig {
  name?: string;
}

export interface IFieldMeta {
  name: string;
  type: FieldTypes;
  isArray: boolean;
  serialize: (...values: any) => any;
  deserialize: (value: any) => any;
  toData: (value: any) => any;
}

export interface IFieldWithEntityConfig extends IFieldConfig {
  entity: new () => IEntity;
}

export interface IFieldWithEntityMeta extends IFieldMeta {
  entity: new () => IEntity;
}


// Document References

export interface IDocumentRef <T extends IEntity> {
  id: string;
  cached: T | null;
  native: firestore.DocumentReference;
  path: string;
  parent: ICollection<T>;
  isFetched(): boolean;
  get(): Promise<T>;
  collection<C extends IEntity>(coll: new () => C): ICollection<C>;
  onSnapshot(
    onNext: (snapshot: IDocumentSnapshot<T>) => void,
    onError?: (error: Error) => void,
  ): (() => void);
}

export interface IDocumentRefConfig extends IFieldWithEntityConfig {
}

export interface IDocumentRefMeta extends IFieldWithEntityMeta {
}

// GeoPoints

export interface IGeoPoint {
  latitude: number;
  longitude: number;
  native: firestore.GeoPoint;
  isEqual: (other: IGeoPoint) => boolean;
}

export interface IGeoPointConfig extends IFieldConfig {
}

export interface IGeoPointMeta extends IFieldMeta {
}

// Field Maps

export interface IFieldMapConfig extends IFieldConfig {
  entity?: new () => any;
}

export interface IFieldMapMeta extends IFieldWithEntityMeta {

}