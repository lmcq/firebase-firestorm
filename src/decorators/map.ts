import { IFieldConfig, FieldTypes, IFieldMeta, WriteTypes } from '../types';
import FieldUtils from '../utils/FieldUtils';
import { getOrCreateRepository } from '../store';
import { isArray } from 'util';

/**
 * Deserializes an object to a firestorm object.
 * @param isArray Is the field an array.
 * @param value The registered fields of the object.
 * @param field The fields for the object.
 */
const deserialize = (
  isArray: boolean,
  value: Object | Object[],
  fields: Map<string, IFieldMeta>,
  Entity: new () => any, 
) => FieldUtils.process(
  isArray,
  value,
  (v: any) => {
    const result = new Entity();
    fields.forEach((value, key) => {
      if (v[value.name]) {
        result[key] = value.deserialize(v[value.name]);
      }
    });
    return result;
  },
);

/**
 * Serializes an firestorm object into a firestore object;
 * @param isArray Whether the field is an array.
 * @param value The firestorm object.
 * @param fields The registered fields of the object.
 * @param writeType Whether it is a create or update operation.
 */
const serialize = (
  isArray: boolean,
  value: Object | Object[],
  fields: Map<string, IFieldMeta>,
  writeType: WriteTypes,
) => FieldUtils.process(
  isArray,
  value,
  (v: any) => {
    const result = {} as any;
    fields.forEach((value, key) => {
      if (v[key] || value.type === FieldTypes.Timestamp) {
        result[value.name] = value.serialize(v[key], writeType);
        if (!result[value.name]) delete result[value.name];
      }
    });
    return result;
  },
);

/**
 * Converts our object to human-readable format.
 * @param isArray Whether the field is an aray
 * @param value The firestorm geopoint(s) representation.
 * @param fields The registered fields of the object.
 */
const toData = (
  isArray: boolean,
  value: Object | Object[],
  fields: Map<string, IFieldMeta>,
) => FieldUtils.process(
  isArray,
  value,
  (v: any) => {
    const result = {} as any;
    fields.forEach((fieldConfig, key) => {
      result[key] = fieldConfig.toData(v[key]);
    });
    Object.keys(result).forEach(key => {
      result[key] === undefined ? delete result[key] : '';
    });
    return result;
  }
)

export default function (fieldConfig: IFieldConfig) {
  return function (target: any, key: string) {
    const type = Reflect.getMetadata('design:type', target, key);
    const field = FieldUtils.configure(
      fieldConfig,
      key,
      type(),
      FieldTypes.Map);
    const repository = getOrCreateRepository(target.constructor.name);
    repository.fields.set(key, field);
    const childRepository = getOrCreateRepository(type.name);
    childRepository.parent = repository;
    field.serialize = (value: any, writeType: WriteTypes) => {
      return serialize(field.isArray, value, childRepository.fields, writeType);
    };
    field.deserialize = (value: any) => {
      return deserialize(field.isArray, value, childRepository.fields, type);
    };
    field.toData = (value: any) => {
      return toData(field.isArray, value, childRepository.fields);
    }
  };
};
