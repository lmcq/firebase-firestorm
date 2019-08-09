import store from '../store';
import { IFieldMeta, IFieldConfig, FieldTypes, FieldConversionType } from '../types';
import { CaseConverter } from '.';

/**
 * Utility functions for fields.
 */
export default class FieldUtils {
  /**
   * Produces the metadata for a field based on the field configuration, and firestorm configuration.
   * @param fieldConfig The field configuration specified in the decorator.
   * @param property The name of the class field property.
   * @param type The type of the field.
   * 
   * @returns The configured field.
   */
  public static configure<T>(
    fieldConfig: IFieldConfig,
    property: string,
    type: T,
    fieldType: FieldTypes,
  ): IFieldMeta {
    const { config } = store();
    let name = '';
    // Providing a field name in the config overrides an conversions.
    if (fieldConfig.name) {
      name = fieldConfig.name;
    } else {
      switch (config.fieldConversion) {
        case FieldConversionType.ToKebabCase:
          name = CaseConverter.camelToKebabCase(property);
          break;
        case FieldConversionType.ToSnakeCase:
          name = CaseConverter.camelToSnakeCase(property);
          break;
        case FieldConversionType.ToCamelCase:
          name = CaseConverter.toCamelCase(property);
          break;
        default:
          name = property;
          break;
      }
    }
    return {
      name,
      type: fieldType,
      isArray: Array.isArray(type),
      deserialize: function (): null { return null; },
      serialize: function (): null { return null; },
      toData: function(): null { return null; },
    };
  };

  /**
   * Utility for running a processor function on a field value or array of values.
   * @param isArray Whether the field is configured to have array values.
   * @param fieldValue The value(s) for the field.
   * @param processSingle Process a single value.
   */
  public static process<T>(
    isArray: boolean,
    fieldValue: T | T[],
    processSingle: ((singleValue: T, ...values: any) => any),
  ): any {
    if (isArray) {
      return (fieldValue as T[]).map(processSingle);
    } else {
      return processSingle(fieldValue as T);
    }
  };
}