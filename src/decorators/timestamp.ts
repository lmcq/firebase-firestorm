import * as firestore from '@google-cloud/firestore';
import { IEntity, FieldTypes, ITimestampConfig, WriteTypes, ITimestampMeta } from '../types';
import FieldUtils from '../utils/FieldUtils';
import { getOrCreateRepository } from '../store';
import { Timestamp } from '../fields';

/**
 * Serializes our representation of a timestamp to firestores.
 * @param isArray Is the field an array.
 * @param updateOnWrite Should the value be auto-updated on creation & updates.
 * @param updateOnCreate Should the value be auto-updated on creation.
 * @param updateOnUpdate Should the value be auto-updated on updates.
 * @param writeType Whether the write is a create or update.
 * @param value A manual value to provide.
 */
const serialize = (
  isArray: boolean,
  updateOnWrite: boolean,
  updateOnCreate: boolean,
  updateOnUpdate: boolean,
  writeType: WriteTypes,
  value: Timestamp | Timestamp[]
) => FieldUtils.process(isArray, value, (v: Timestamp) => {
  const isAutoWriteCondition = writeType === WriteTypes.Create && (updateOnWrite || updateOnCreate);
  const isAutoUpdateConfition = writeType === WriteTypes.Update && (updateOnWrite || updateOnUpdate);
  if (isAutoWriteCondition || isAutoUpdateConfition) {
    return firestore.FieldValue.serverTimestamp();
  } else if (v && v.native) {
    return v.native;
  } else {
    return undefined;
  }
});

/**
 * Deserializes a firestore timestamp into a firestorm timestamp.
 * @param isArray Is the field an array.
 * @param value The firestore timestamp to deserialize.
 */
const deserialize = (
  isArray: boolean,
  value: firestore.Timestamp | firestore.Timestamp[],
) => FieldUtils.process(isArray, value, (v: firestore.Timestamp) => {
  return new Timestamp(
    v.seconds,
    v.nanoseconds,
  );
});

/**
 * Converts a firestorm timestamp into a string representation.
 * @param isArray Is the field an array.
 * @param format A custom formatter for the date value.
 * @param value A firestorm timestamp.
 */
const toData = (
  isArray: boolean,
  format: ((date: Date) => string),
  value: Timestamp | Timestamp[],
) => FieldUtils.process(isArray, value, (v: Timestamp) => format(v.toDate()));

export default function (fieldConfig: ITimestampConfig) {
  return function (target: any, key: string) {
    const type = Reflect.getMetadata('design:type', target, key);
    const field = FieldUtils.configure(
      fieldConfig,
      key,
      type(),
      FieldTypes.Timestamp,
    ) as ITimestampMeta;
    field.updateOnWrite = fieldConfig.updateOnWrite || false;
    field.updateOnCreate = fieldConfig.updateOnCreate || false;
    field.updateOnUpdate = fieldConfig.updateOnUpdate || false;
    field.format = fieldConfig.format || ((date: Date) => date.toLocaleString());
    field.deserialize = (value: firestore.Timestamp | firestore.Timestamp[]) => {
      return deserialize(field.isArray, value);
    };
    field.serialize = (value: Timestamp | Timestamp[], writeType: WriteTypes) => {
      return serialize(
        field.isArray,
        field.updateOnWrite,
        field.updateOnCreate,
        field.updateOnUpdate,
        writeType,
        value,
      );
    };
    field.toData = (value: Timestamp | Timestamp[]) => {
      return toData(
        field.isArray,
        field.format,
        value,
      );
    };
    const repository = getOrCreateRepository(target.constructor.name);
    repository.fields.set(key, field);
  };
};
