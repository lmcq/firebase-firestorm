import * as firebase from 'firebase/app';
import {
  IFireormConfig,
  IFieldMeta,
  IStore,
  IRepository,
  ICollectionConfig,
  FieldConversionType,
} from './types';

let store: IStore  = {
  repositories: new Map<string, IRepository>(),
  config: {
    fieldConversion: FieldConversionType.NoConversion,
  }
};

/**
 * Initializes firestorm with an instance of firestore.
 * @param firestore A firestore instance.
 * @param config Configuration options for firestorm.
 */
export const initialize = (firestore: firebase.firestore.Firestore, config?: IFireormConfig): void => {
  store.firestore = firestore;
  if (config) {
    (Object.keys(config) as (keyof IFireormConfig)[]).forEach((key): void => {
      store.config[key] = config[key];
    });
  }
};

/**
 * Resets the store
 */
export const destroy = (): void => {
  store = {
    repositories: store.repositories,
    firestore: undefined,
    config: {
      fieldConversion: FieldConversionType.NoConversion,
    },
  };
};

/**
 * Gets a repository with a given name
 * @param key The name of the [[Entity]] class
 */
export const getRepository = (key: string): IRepository => {
  if (store.repositories.has(key)) {
    return store.repositories.get(key) as IRepository;
  }
  throw new Error(`Repository ${key} is not defined`);
};

/**
 * Creates a repository with a given name if it doesn't
 * exist, and returns the repository.
 * @param key The name of the [[Entity]] class
 */
export const getOrCreateRepository = (key: string): IRepository => {
  if (!store.repositories.has(key)) {
    store.repositories.set(key, {
      collectionConfig: {} as unknown as ICollectionConfig,
      fields: new Map<string, IFieldMeta>(),
      subcollections: new Map<string, IRepository>(),
    });
  }
  return getRepository(key);
};

export default (): IStore => store;
