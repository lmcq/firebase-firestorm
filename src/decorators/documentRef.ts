import * as firestore from '@google-cloud/firestore';
import { IDocumentRefConfig, IDocumentRefMeta, FieldTypes, IDocumentRef, IEntity, ICollection } from '../types';
import FieldUtils from '../utils/FieldUtils';
import { getOrCreateRepository, getRepository } from '../store';
import { Entity, Collection, DocumentRef } from '..';

/**
 * Deserializes a firestore document reference into a firestorm document reference.
 * @param isArray Is the field an array.
 * @param value The firestore geopoint(s) representation.
 */
const serialize = (
  isArray: boolean,
  value: IDocumentRef<IEntity> | IDocumentRef<IEntity>[],
): firestore.DocumentReference => {
  return FieldUtils.process(
    isArray,
    value,
    (v: IDocumentRef<IEntity>): firestore.DocumentReference => v.native,
  );
};
/**
 * Deserializes firestore document ref(s) into our representation.
 * @param isArray Is the field an array.
 * @param entity The entity of the document.
 * @param value The firestore document ref(s).
 */
const deserialize = (
  isArray: boolean,
  entity: new () => IEntity,
  value: firestore.DocumentReference | firestore.DocumentReference[],
): IDocumentRef<IEntity> | IDocumentRef<IEntity>[] => {
  const deserializeValue = (firestoreDocRef: firestore.DocumentReference): IDocumentRef<IEntity> => {
    let parentEntityName = entity.prototype.constructor.name;
    let firestoreParent: firestore.CollectionReference | null = firestoreDocRef.parent || null;
    
    /**
     * Recursive function to construct the parent tree of a document referenc.e
     * @param entityName Name of the entity (in the repository store).
     * @param firestoreCollectionRef The firestore collection reference.
     */
    const buildCollectionTree = (
      entityName: string,
      firestoreCollectionRef: firestore.CollectionReference,
    ): ICollection<IEntity, any> | any => {
      const collectionRepository = getRepository(entityName);
      if (collectionRepository.entity) {
        if (!collectionRepository.parent) {
          return Collection(collectionRepository.entity);
        }
        if (firestoreCollectionRef.parent
          && firestoreCollectionRef.parent.parent
          && collectionRepository.parent.entity
        ) {
          return Collection(
            collectionRepository.entity,
            DocumentRef(
              firestoreCollectionRef.parent.id,
              collectionRepository.entity,
              buildCollectionTree(
                collectionRepository.parent.entity.prototype.constructor.name,
                firestoreCollectionRef.parent.parent,
              ),
            ),
          );
        }
      }
    };
    return DocumentRef(firestoreDocRef.id, entity, buildCollectionTree(parentEntityName, firestoreParent)) as any;
  };
  if (isArray) {
    return (value as firestore.DocumentReference[]).map(deserializeValue);
  } else {
    return deserializeValue(value as firestore.DocumentReference);
  }
};

/**
 * Converts a document reference into a human-readable format.
 * If the document ref's data has been fetched, include the data,
 * otherwise skip it.
 * @param isArray Is the field an array.
 * @param value Our document ref(s) to convert.
 */
const toData = (
  isArray: boolean,
  value: IDocumentRef<IEntity> | IDocumentRef<IEntity>[],
): Record<string, any> | Record<string, any>[] | undefined => {
  const valueToData = (v: IDocumentRef<IEntity>): Record<string, any> | undefined => {
    if (v.isFetched() && v.cached !== null) {
      return v.cached.toData();
    }
  };
  if (isArray) {
    return (value as IDocumentRef<Entity>[]).map(valueToData).filter((v): boolean => Boolean(v));
  } else {
    return valueToData(value as IDocumentRef<IEntity>);
  }
};

/**
 * Registers a document reference field.
 * @param docRefConfig The field configuration.
 */
export default function (docRefConfig: IDocumentRefConfig): Function {
  return function(target: any, key: string): void {
    const type = Reflect.getMetadata('design:type', target, key);
    const field = FieldUtils.configure(
      docRefConfig,
      key,
      type(),
      FieldTypes.DocumentReference
    ) as IDocumentRefMeta;
    field.entity = docRefConfig.entity;
    // Serialization Functions
    field.serialize = (
      value: IDocumentRef<IEntity> | IDocumentRef<IEntity>[],
    ): firestore.DocumentReference | firestore.DocumentReference => {
      return serialize(field.isArray, value);
    };
    field.deserialize = (
      value: firestore.DocumentReference | firestore.DocumentReference[],
    ): IDocumentRef<IEntity> | IDocumentRef<IEntity>[] => {
      return deserialize(field.isArray, field.entity, value);
    };
    field.toData = (
      value: IDocumentRef<IEntity> | IDocumentRef<Entity>
    ): Record<string, any> | Record<string, any>[] | undefined => {
      return toData(field.isArray, value);
    };
    // Register the document reference field.
    const repository = getOrCreateRepository(target.constructor.name);
    repository.fields.set(key, field);
  };
};
