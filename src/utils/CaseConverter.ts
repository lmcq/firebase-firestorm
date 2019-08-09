/**
 * Utility functions to convert between different case notations.
 */
export default class CaseConverter {
  /**
   * Converts a camelCase string to snake_case.
   * @param str The camelCase string to convert.
   * 
   * @returns A snake_case representation of the string.
   */
  public static camelToSnakeCase = (str: string): string => {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1_$2')
      .replace(/-/g, '_')
      .toLowerCase();
  };

  /**
   * Converts a camelCase string to kebab-case
   * @param str The camelCase string to convert.
   * 
   * @returns A kebab-case representation of the string.
   */
  public static camelToKebabCase = (str: string): string => {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
      .replace(/_/g, '-')
      .toLowerCase();
  };

  /**
   * Converts either a snake_case or kebab-case string to camelCase.
   * @param str The snake/kebab case string to convert.
   * 
   * @returns A camelCase representation of the string.
   */
  public static toCamelCase = (str: string): string => {
    if (str.length) {
      str = str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str.replace(/([-_][a-z])/ig, (fst): string => {
      return fst.toUpperCase()
        .replace('-', '')
        .replace('_', '');
    });
  }
}