import { FieldTypes, IFieldMeta, WriteTypes, IEntity, FirestormData, IFieldMapConfig, IFieldMapMeta } from '../types';
import FieldUtils from '../utils/FieldUtils';
import { getOrCreateRepository } from '../store';

/**
 * Deserializes an object to a firestorm object.
 * @param isArray Is the field an array.
 * @param value The registered fields of the object.
 * @param field The fields for the object.
 */
const deserialize = (
  isArray: boolean,
  value: Record<string, any> | Record<string, any>[],
  fields: Map<string, IFieldMeta>,
  Entity: new () => any, 
): IEntity | IEntity[] => {
  return FieldUtils.process(
    isArray,
    value,
    (v: Record<string, any>): IEntity => {
      const result = new Entity();
      fields.forEach((value, key): void => {
        if (v[value.name]) {
          result[key] = value.deserialize(v[value.name]);
        }
      });
      return result;
    },
  );
};

/**
 * Serializes an firestorm object into a firestore object;
 * @param isArray Whether the field is an array.
 * @param value The firestorm object.
 * @param fields The registered fields of the object.
 * @param writeType Whether it is a create or update operation.
 */
const serialize = (
  isArray: boolean,
  value: Record<string, any> | Record<string, any>[],
  fields: Map<string, IFieldMeta>,
  writeType: WriteTypes,
): Record<string, any> | Record<string, any> => {
  return FieldUtils.process(
    isArray,
    value,
    (v: any): Record<string, any> => {
      const result = {} as any;
      fields.forEach((value, key): void => {
        if (v[key] || value.type === FieldTypes.Timestamp) {
          result[value.name] = value.serialize(v[key], writeType);
          if (!result[value.name]) delete result[value.name];
        }
      });
      return result;
    },
  );
};

/**
 * Converts our object to human-readable format.
 * @param isArray Whether the field is an aray
 * @param value The firestorm geopoint(s) representation.
 * @param fields The registered fields of the object.
 */
const toData = (
  isArray: boolean,
  value: Record<string, any> | Record<string, any>[],
  fields: Map<string, IFieldMeta>,
): FirestormData | FirestormData[] => {
  return FieldUtils.process(
    isArray,
    value,
    (v: any): FirestormData => {
      const result = {} as any;
      fields.forEach((fieldConfig, key): void => {
        result[key] = fieldConfig.toData(v[key]);
      });
      Object.keys(result).forEach((key): void => {
        result[key] === undefined ? delete result[key] : '';
      });
      return result;
    }
  );
};

/**
 * Registers a new map with firestorm.
 * @param fieldConfig The field configuration
 */
export default function (fieldConfig: IFieldMapConfig): Function {
  return function (target: any, key: string): void {
    const type = Reflect.getMetadata('design:type', target, key);
    const field = FieldUtils.configure(
      fieldConfig,
      key,
      new type(),
      FieldTypes.Map) as IFieldMapMeta;
    if (field.isArray && !fieldConfig.entity) {
      throw new Error(`Map arrays must be provided with an entity in ${target}[${key}]`);
    }
    field.entity = fieldConfig.entity || type;
    const repository = getOrCreateRepository(target.constructor.name);
    repository.fields.set(key, field);
    const childRepository = getOrCreateRepository(type.name);
    childRepository.parent = repository;
    field.serialize = (
      value: Record<string, any> | Record<string, any>[],
      writeType: WriteTypes,
    ): Record<string, any> | Record<string, any>[] => {
      return serialize(field.isArray, value, childRepository.fields, writeType);
    };
    field.deserialize = (value: any): Record<string, any> | Record<string, any>[] => {
      return deserialize(field.isArray, value, childRepository.fields, field.entity);
    };
    field.toData = (value: any): FirestormData | FirestormData[] => {
      return toData(field.isArray, value, childRepository.fields);
    }
  };
};
