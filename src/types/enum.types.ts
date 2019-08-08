export enum FieldConversionType {
  ToCamelCase = 'toCamelCase',
  ToSnakeCase = 'toSnakeCase',
  ToKebabCase = 'toKebabCase',
  NoConversion = 'noConversion',
};

export enum FieldTypes {
  Standard = 'standard',
  Map = 'map',
  DocumentReference = 'documentReference',
  Timestamp = 'timestamp',
  GeoPoint = 'geoPoint',
};

export enum WriteTypes {
  Create,
  Update,
};


