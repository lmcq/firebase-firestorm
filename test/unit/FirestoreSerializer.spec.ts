import { expect } from 'chai';
import 'mocha';
import { Timestamp, Collection, WriteTypes } from '../../src';
import { FirestoreSerializer } from '../../src/utils';

import * as bootstrap from '../../test/bootstrap.spec';
import Author from '../entities/Author';
import Post from '../entities/Post';
import Comment from '../entities/Comment';

describe('[unit] FirestoreSerializer', () => {
  // Setup firestorm and get doc refs
  beforeEach(() => {
    bootstrap.start();
  });
  describe('#serialize', () => {
    describe('serializing create request', () => {
      const postData = new Post();
      postData.id = 'test';
      postData.title = 'title';
      postData.body = 'body';
      let serialized = FirestoreSerializer.serialize(postData, WriteTypes.Create)
      it('should have an id when provided', () => {
        expect(serialized.id).to.equal('test');
      });
      it('should not have an id when not provided', () => {
        postData.id = undefined as any;
        serialized = FirestoreSerializer.serialize(postData, WriteTypes.Create);
        expect(serialized.id).to.be.undefined;
      });
      it('should have a field when provided', () => {
        expect(serialized.title).to.equal('title');
      });
      it('should not include a field when undefined', () => {
        postData.title = undefined as any;
        serialized = FirestoreSerializer.serialize(postData, WriteTypes.Create);
        expect(serialized).to.not.have.key('title');
      });
      it('should autogenerate a timestamp if configured to on create', () => {
        expect(serialized.posted).to.not.be.undefined;
      });
      it('should produce a single document reference', () => {
        const authorRef = Collection(Author).doc('john-doe');
        postData.author = authorRef;
        serialized = FirestoreSerializer.serialize(postData, WriteTypes.Create);
        expect(serialized.author.id).to.equal('john-doe');
      });
      it('should produce array of document references', () => {
        const authorData = new Author();
        const commentRef = Collection(Post).doc('hello-world').collection(Comment).doc('comment-1');
        authorData.favoritedComments = [
          commentRef,
        ];
        const authorSerialized = FirestoreSerializer.serialize(authorData, WriteTypes.Create);
        expect(authorSerialized.favoritedComments).to.have.length(1);
      });
    });
    describe('serializing update request', () => {
      let postData: Post;
      beforeEach(async () => {
        postData = await Collection(Post).get('hello-world') as Post;
      });
      // essentially the same as create expect how timestamps are handled.
      it('should remove timestamp if not provided', () => {
        postData.posted = undefined as any;
        const serialized = FirestoreSerializer.serialize(postData, WriteTypes.Update);
        expect(serialized).to.not.have.key('posted');
      });
      it('should include timestamp if provided and not set to auto-update', () => {
        postData.posted = Timestamp.fromMillis(0);
        const serialized = FirestoreSerializer.serialize(postData, WriteTypes.Update);
        expect(serialized.posted).to.not.be.null.and.not.be.undefined;
        expect(serialized.posted.isEqual(Timestamp.fromMillis(0).native)).to.be.true;
      });
    });
  });
  describe('#deserialize', () => {
    it('should produce a valid path', () => {
      // expect(doc.path).to.equal('/posts/hello-world');
    });
  });
});