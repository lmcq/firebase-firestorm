import { IEntity, IDocumentRef } from './types';
import { getRepository } from './store';

/**
 * Represention of a document in a collection.
 */
export default class Entity implements IEntity {
  // The ID of the document.
  public id! : string;
  // The document reference of the document.
  public ref!: IDocumentRef<this>;

  /**
   * Converts an entity into a human-readable format.
   */
  public toData() : Object {
    const { fields } = getRepository(this.constructor.name);
    const result = {} as any;
    result.id = this.id;
    fields.forEach((fieldConfig, key) => {
      const k = key as keyof this;
      result[key] = fieldConfig.toData(this[k]);
    });
    Object.keys(result).forEach(key => {
      result[key] === undefined ? delete result[key] : '';
    });
    return result;
  }
}