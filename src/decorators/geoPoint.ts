import * as firestore from '@google-cloud/firestore';
import { FieldTypes, IGeoPointConfig, IGeoPoint, GeoPointData } from '../types';
import FieldUtils from '../utils/FieldUtils';
import { getOrCreateRepository } from '../store';
import { GeoPoint } from '..';

/**
 * Deserializes a firestore geopoint into a firestorm geopoint.
 * @param isArray Is the field an array.
 * @param value The firestore geopoint(s) representation.
 */
const deserialize = (
  isArray: boolean, value: firestore.GeoPoint | firestore.GeoPoint[],
): IGeoPoint | IGeoPoint[] => {
  return FieldUtils.process(
    isArray,
    value,
    (v: firestore.GeoPoint): GeoPoint => new GeoPoint(v.latitude, v.longitude),
  );
};

/**
 * Serializes our representation of a geopoint into a firestorm geopoint;
 * @param isArray Whether the field is an array.
 * @param value The firestorm geopoint(s) representation.
 */
const serialize = (
  isArray: boolean, value: IGeoPoint | IGeoPoint[],
): firestore.GeoPoint | firestore.GeoPoint[] => {
  return FieldUtils.process(
    isArray,
    value,
    (v: IGeoPoint): firestore.GeoPoint => v.native,
  );
};

/**
 * Converts our firestorm representation of geopoint to human-readable format.
 * @param isArray Whether the field is an aray
 * @param value The firestorm geopoint(s) representation.
 */
const toData = (
  isArray: boolean, value: IGeoPoint | IGeoPoint[],
): GeoPointData | GeoPointData[] => FieldUtils.process(
  isArray,
  value,
  (v: IGeoPoint): GeoPointData => ({
    latitude: v.latitude,
    longitude: v.longitude,
  }),
);

/**
 * Registers a geopoint field.
 * @param fieldConfig The field configuration for the geopoint.
 */
export default function (fieldConfig?: IGeoPointConfig): Function {
  return function (target: any, key: string): void {
    const type = Reflect.getMetadata('design:type', target, key);
    // Process the field configuration.
    const field = FieldUtils.configure(
      fieldConfig || {},
      key,
      type(),
      FieldTypes.GeoPoint,
    );
    // Serialization Functions
    field.deserialize = (
      value: firestore.GeoPoint | firestore.GeoPoint[],
    ): IGeoPoint | IGeoPoint[] => deserialize(
      field.isArray,
      value,
    );
    field.serialize = (
      value: IGeoPoint | IGeoPoint[],
    ): firestore.GeoPoint | firestore.GeoPoint[] => serialize(
      field.isArray,
      value,
    );
    field.toData = (
      value: IGeoPoint | IGeoPoint[],
    ): GeoPointData | GeoPointData[] => toData(
      field.isArray,
      value,
    );
    // Register the field for the parent entity.
    const repository = getOrCreateRepository(target.constructor.name);
    repository.fields.set(key, field);
  };
};
