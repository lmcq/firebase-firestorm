import { Firestore } from '@google-cloud/firestore';
import { expect } from 'chai';
import 'mocha';
import {
  Collection,
  ICollection,
  IDocumentRef,
  DocumentRef
} from '../../src';

import * as bootstrap from '../bootstrap.spec';
import Post from '../entities/Post';
import Comment from '../entities/Comment';
import Author from '../entities/Author';

describe('[unit] DocumentRef', () => {
  let post: ICollection<Post>;
  let doc: IDocumentRef<Post>;
  let firestore: Firestore;
  
  // Setup firestorm and get doc refs
  beforeEach(() => {
    bootstrap.start();
    post = Collection(Post);
    doc = DocumentRef('hello-world', Post, post);
    firestore = bootstrap.getFirestore();
  });
  describe('#id', () => {
    it('should provide the document ID', () => {
      expect(doc.id).to.equal('hello-world');
    });
  });
  describe('#path', () => {
    it('should produce a valid path', () => {
      expect(doc.path).to.equal('/posts/hello-world');
    });
    it('document ref to nested document should produce valid path', async () => {
      const author = await Collection(Author).get('john-doe');
      if (author) {
        const favoriteComment = author.favoritedComments[0];
        expect(favoriteComment).to.not.be.null;
        expect(favoriteComment.path).to.equal('/posts/hello-world/comments/comment-1');
      }
    });
  });
  describe('#parent', () => {
    it('parent should be equal to Post collection', () => {
      expect(doc.parent).to.be.eql(post);
    });
  });
  describe('#native', () => {
    it('native reference should equal firestore reference', () => {
      expect(doc.native.id).to.eql(firestore.doc('posts/hello-world').id);
    });
  });
  describe('#collection', () => {
    it('should produce valid collection reference', () => {
      const commentCollect = doc.collection(Comment);
      expect(commentCollect.path).to.equal(`/${firestore.collection('posts/hello-world/comments').path}`);
    });
  });
  describe('#get', () => {
    it('should get the document data', async () => {
      expect(doc.isFetched()).to.equal(false);
      const data = await doc.get();
      expect(doc.isFetched()).to.equal(true);
      expect(data).to.not.be.null.and.to.not.be.undefined;
      expect(data.title).to.equal('Hello World!');
      expect(data.body).to.equal('This is an example post.');
      expect(data.author.id).to.equal('john-doe');
    });
    it('already fetched doc should return cached', async () => {
      expect(doc.isFetched()).to.equal(false);
      let data = await doc.get();
      expect(doc.isFetched()).to.equal(true);
      data = await doc.get();
      expect(data).to.not.be.null.and.to.not.be.undefined;
      expect(data.title).to.equal('Hello World!');
      expect(data.body).to.equal('This is an example post.');
      expect(data.author.id).to.equal('john-doe');
    });
  });
});