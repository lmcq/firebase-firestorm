import * as bootstrap from '../../test/bootstrap.spec';
import { expect } from 'chai';
import 'mocha';
import { Collection } from '../../src';
import Post from '../entities/Post';
import { getRepository } from '../../src/store';

describe('[functional] configuration', () => {

  describe('usage without calling initialize()', () => {
    beforeEach(() => {
      bootstrap.reset();
    });
    it('should throw an error', () => {
      expect(() => Collection(Post)).to.throw(Error);
    });
  });

  describe('usage when calling initialize()', () => {
    beforeEach(() => {
      bootstrap.start();
    });
    it('getting an undefined repository should throw an error', () => {
      expect(() => getRepository('UndefinedEntity')).to.throw(Error);
    });
    it('getting a defined repository should should return the configuration', () => {
      expect(() => getRepository('Post')).to.not.throw(Error);
      const postRepository = getRepository('Post');
      expect(postRepository.fields).to.include.keys([
        'title', 'body', 'author', 'posted',
      ]);
      expect(postRepository.collectionConfig.name).to.equal('posts');
    });
  });
});