import { IFieldConfig, FieldTypes } from '../types';
import FieldUtils from '../utils/FieldUtils';
import { getOrCreateRepository } from '../store';

export default function (fieldConfig: IFieldConfig): Function {
  return function(target: any, key: string): void {
    const type = Reflect.getMetadata('design:type', target, key);
    const field = FieldUtils.configure(
      fieldConfig,
      key,
      type(),
      FieldTypes.Standard);
    field.serialize = (value: any): any => value;
    field.deserialize = (value: any): any => value;
    field.toData = (value: any): any => value;
    const repository = getOrCreateRepository(target.constructor.name);
    repository.fields.set(key, field);
  };
};
