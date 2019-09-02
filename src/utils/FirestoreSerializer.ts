import { firestore } from 'firebase/app';
import { FieldTypes, ICollection, WriteTypes } from '../types';
import { getRepository } from '../store';
import Entity from '../Entity';
import DocumentRef from '../fields/DocumentRef';
import Collection from '../Collection';

interface ISerializedResult {
  id?: string;
  [key: string]: any;
}

/**
 * Class to help with serialization between [[Entity]] objects and firestore documents.
 */
export default class FirestoreSerializer {
  /**
   * Serializes an [[Entity]] to an object which can be inserted into firestore.
   * @param entity Our representation of the entity.
   */
  public static serialize<T extends Entity>(entity: T, writeType: WriteTypes): ISerializedResult {
    const { fields } = getRepository(entity.constructor.name);
    const serialized: ISerializedResult = {};
    serialized.id = entity.id;
    fields.forEach((value, key): void => {
      const k = key as keyof T;
      if (entity[k] || value.type === FieldTypes.Timestamp) {
        serialized[key] = value.serialize(entity[k], writeType);
        if (!serialized[key]) delete serialized[key];
      }
    });
    return serialized;
  }

  /**
   * Deserializes a firestore document into an [[Entity]].
   * @param doc The firestore document.
   * @param Model The [[Entity]] class to create an instance of.
   */
  public static deserialize<T extends Entity>(doc: firestore.DocumentSnapshot, Model: new () => T, parentCollection: ICollection<T>): T {
    const { fields, subcollections } = getRepository(Model.prototype.constructor.name);
    const deserialized = new Model() as any;
    deserialized.id = doc.id;
    const ref = DocumentRef(deserialized.id, Model, parentCollection);
    deserialized.ref = ref;
    const docData = doc.data() as any;
    // Deserialize each of the registered fields.
    fields.forEach((value, key): void => {
      if (docData[value.name]) {
        let k = key as keyof T;
        deserialized[k] = value.deserialize(docData[value.name]);
      }
    });
    // Create collection references for registered subcollections.
    subcollections.forEach((value, key): void => {
      if (value.entity) {
        let k = key as keyof T;
        deserialized[k] = Collection(value.entity, ref);
      }
    });
    return deserialized;
  }
}
