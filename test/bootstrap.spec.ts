import * as firestorm from '../src';
import { IFireormConfig } from '../src/types';
import * as firebase from 'firebase/app';
import firebaseAdmin from 'firebase-admin';
import 'firebase/firestore';
import 'firebase/auth';

let firestore: firebase.firestore.Firestore;
let app: firebase.app.App;

before(async (): Promise<void> => {
  require('dotenv').config();
  app = firebase.initializeApp(JSON.parse(process.env.CLIENT_SDK_CONFIG as string));
  const admin = firebaseAdmin.initializeApp();
  const token = await admin.auth().createCustomToken('firestorm');
  await app.auth().signInWithCustomToken(token);
  firestore = app.firestore();
});

after((): void => {
  app.delete();
});

export const start = (config? : IFireormConfig): void => {
  firestorm.initialize(firestore, config);
}

export const reset = (): void => {
  firestorm.destroy();
};

export const getFirestore = (): firebase.firestore.Firestore => firestore;
export const bootstrapNull = (): void => {
  firestorm.initialize(null as any);
};
