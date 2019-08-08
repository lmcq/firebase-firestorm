import { Firestore } from '@google-cloud/firestore';
import { expect } from 'chai';
import 'mocha';
import {
  Collection,
  ICollection,
} from '../../src';

import * as bootstrap from '../bootstrap.spec';
import Post from '../entities/Post';
import Comment from '../entities/Comment';
import Author from '../entities/Author';

describe('[unit] Collection', () => {
  describe('calling Collection(IEntity) without calling initialize()', () => {
    beforeEach(() => {
      bootstrap.reset();
    });
    it('should throw an error', () => {
      expect(() => Collection(Post)).to.throw(Error);
    });
  });

  describe('calling Collection(IEntity) when calling initialize()', () => {
    beforeEach(() => {
      bootstrap.start();
    });
    describe('with invalid entity', () => {
      it('should throw an error', () => {
        expect(() => Collection(undefined as any)).to.throw(Error);
      });
    });
    describe('with valid entity', () => {
      let post : ICollection<Post>;
      let comments : ICollection<Comment>;
      let firestore : Firestore;
      beforeEach(() => {
        post = Collection(Post);
        comments = Collection(Comment);
        firestore = bootstrap.getFirestore();
      });
      it('should not throw an error', () => {
        expect(() => Collection(Post)).to.not.throw(Error);
      });
      describe('#doc', () => {
        it('should provide a document ref when provided a valid ID', () => {
          const doc = post.doc('hello-world');
          expect(doc).to.not.be.null.and.not.be.undefined;
        });
      });
      describe('#path', () => {
        it('root collection should produce a valid path', () => {
          expect(post.path).to.equal('/posts');
        });
        it('sub collection should produce a valid path', () => {
          const doc = post.doc('hello-world');
          expect(doc.collection(Comment).path).to.equal('/posts/hello-world/comments');
        });
      });
      describe('#parent', () => {
        it('root collection should have null parent', () => {
          expect(post.parent).to.be.null;
        });
        it('sub collection parent should be document ref', () => {
          const commentCollection = post.doc('hello-world').collection(Comment);
          const doc = commentCollection.parent;
          if (doc) {
            const firestoreDoc = firestore.doc('/posts/hello-world');
            expect(doc.path).to.equal(`/${firestoreDoc.path}`);
            expect(doc.id).to.equal(firestoreDoc.id);
          }
        });
        it('invalid subcollection from post ref should throw an error', () => {
          expect(() => post.doc('hello-wolrd').collection(Author)).to.throw(Error);
        });
      });
      describe('#native', () => {
        it('root collection native reference should equal firestore reference', () => {
          expect(post.native.id).to.eql(firestore.collection('posts').id);
        });
        it('subcollection native should equal firestore reference', () => {
          const commentCollection = post.doc('hello-world').collection(Comment);
          expect(commentCollection.native.id).to.eql(firestore.collection('posts/hello-world/comments').id);
        });
      });
    });
  });
});