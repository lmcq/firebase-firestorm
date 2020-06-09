import { firestore } from '../firestore';
import { ICollectionConfig, ISubCollectionConfig, IEntity } from './collection.types';
import { FieldConversionType } from './enum.types';
import { IFieldMeta } from './field.types';

export interface IStore {
  firestore?: firestore.Firestore;
  repositories: Map<string, IRepository>;
  config: IFireormConfig;
}

export interface IFireormConfig {
  fieldConversion: FieldConversionType;
}

export interface IRepository {
  collectionConfig: ICollectionConfig | ISubCollectionConfig;
  entity?: new () => IEntity;
  parent?: IRepository;
  fields: Map<string, IFieldMeta>;
  subcollections: Map<string, IRepository>;
}
