import * as firestore from '@google-cloud/firestore';
import { IDocumentRef } from './field.types';

export interface IEntity {
  id: string;
  ref: IDocumentRef<any>;
  toData(): Record<string, any>;
}

export interface ICollection <T extends IEntity, P extends IEntity = any> {
  native: firestore.CollectionReference;
  path: string;
  parent? : IDocumentRef<P> | null;
  create: (entity: T) => Promise<T | null>;
  update: (entity: T) => Promise<T | null>;
  doc: (id: string) => IDocumentRef<T>;
  get: (id: string) => Promise<T | null>;
  find: (query? : ICollectionQuery<T>) => Promise<T[]>;
  remove: (id: string) => Promise<void>;
};

export interface ICollectionConfig {
  name: string;
}

type WhereQuery <T extends IEntity> = [
  keyof T,
  firestore.WhereFilterOp,
  any,
];

type OrderByQuery <T extends IEntity> = [
  keyof T,
  firestore.OrderByDirection?,
]

type StartAtQuery <T extends IEntity> = T | any;
type StartAfterQuery <T extends IEntity> = T | any;
type EndAtQuery <T extends IEntity> = T | any;
type EndBeforeQuery <T extends IEntity> = T | any;

export interface ICollectionQuery <T extends IEntity> {
  where?: WhereQuery<T>[];
  orderBy?: OrderByQuery<T>[];
  limit?: number;
  startAt?: StartAtQuery<T>;
  startAfter?: StartAfterQuery<T>;
  endAt?: EndAtQuery<T>;
  endBefore?: EndBeforeQuery<T>;
}

export interface ISubCollectionConfig extends ICollectionConfig {
  entity: new () => IEntity;
}