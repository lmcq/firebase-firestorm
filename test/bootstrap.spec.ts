import * as firestorm from '../src';
import { IFireormConfig } from '../src/types';
import { Firestore } from '@google-cloud/firestore';
let firestore : Firestore;

export const start = (config? : IFireormConfig) => {
  firestore = new Firestore();
  firestorm.initialize(firestore, config);
}

export const reset = () => {
  firestorm.destroy();
};

export const getFirestore = () => firestore;
export const bootstrapNull = () => {
  firestorm.initialize(null as any);
};
