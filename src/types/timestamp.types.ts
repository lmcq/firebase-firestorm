import * as firestore from '@google-cloud/firestore';
import { IFieldConfig, IFieldMeta, WriteTypes } from '.';
import { Timestamp } from '../fields';

export interface ITimestamp {
  seconds: number;
  nanoseconds: number;
  native: firestore.Timestamp;
  toDate: () => Date;
  toMillis: () => number;
  isEqual: (other: ITimestamp) => boolean;
}

export interface ITimestampConfig extends IFieldConfig {
  isArray? : boolean;
  updateOnWrite?: boolean;
  updateOnCreate?: boolean;
  updateOnUpdate?: boolean;
  format?: (date: Date) => string;
}

export interface ITimestampMeta extends IFieldMeta {
  updateOnWrite: boolean;
  updateOnCreate: boolean;
  updateOnUpdate: boolean;
  serialize: (
    value: Timestamp | Timestamp[],
    writeType: WriteTypes,
  ) => firestore.Timestamp | firestore.Timestamp[] | firestore.FieldValue | firestore.FieldValue[];
  format: (date: Date) => string;
}