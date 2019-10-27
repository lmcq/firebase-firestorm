import { firestore as firebaseFirestore } from 'firebase/app';
import * as CloudFirestore from '@google-cloud/firestore';

const Timestamp = firebaseFirestore ? firebaseFirestore.Timestamp : CloudFirestore.Timestamp;
const GeoPoint = firebaseFirestore ? firebaseFirestore.GeoPoint : CloudFirestore.GeoPoint;
const FieldValue = firebaseFirestore ? firebaseFirestore.FieldValue : CloudFirestore.FieldValue;

export namespace firestore {
  export type Timestamp = firebaseFirestore.Timestamp | CloudFirestore.Timestamp;
  export type GeoPoint = firebaseFirestore.GeoPoint | CloudFirestore.GeoPoint;
  export type FieldValue = firebaseFirestore.FieldValue | CloudFirestore.FieldValue;
  export type QuerySnapshot = firebaseFirestore.QuerySnapshot;
  export type WhereFilterOp = firebaseFirestore.WhereFilterOp;
  export type OrderByDirection = firebaseFirestore.OrderByDirection;
  export type CollectionReference = firebaseFirestore.CollectionReference;
  export type DocumentChangeType = firebaseFirestore.DocumentChangeType;
  export type DocumentReference = firebaseFirestore.DocumentReference;
  export type DocumentSnapshot = firebaseFirestore.DocumentSnapshot;
  export type Query = firebaseFirestore.Query;
  export type Firestore = firebaseFirestore.Firestore;
  export type SnapshotMetadata = firebaseFirestore.SnapshotMetadata;
  export type SnapshotListenOptions = firebaseFirestore.SnapshotListenOptions;
}

export const firestore = {
  Timestamp,
  GeoPoint,
  FieldValue,
};
