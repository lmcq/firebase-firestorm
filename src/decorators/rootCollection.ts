import { ICollectionConfig } from '../types';
import { getOrCreateRepository } from '../store';

/**
 * Registers a collection with firestorm.
 * @param config The configuration for the collection.
 */
export default (config : ICollectionConfig) => {
  return (target : Function) : void => {
    const repository = getOrCreateRepository(target.prototype.constructor.name);
    repository.collectionConfig = config;
    repository.entity = target.prototype.constructor;
  };
};
