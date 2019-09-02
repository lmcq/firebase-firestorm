import * as bootstrap from '../../test/bootstrap.spec';
import chai, { expect } from 'chai';
import 'mocha';
import chaiAsPromised from 'chai-as-promised';
import { Collection, ICollection, IQuerySnapshot, IDocumentSnapshot } from '../../src';
import Post from '../entities/Post';

chai.use(chaiAsPromised);

describe('[functional] realtime updates', (): void => {

  describe('on documents', (): void => {
    let post: Post;
    let documentListener: (() =>  void);
    beforeEach(async (): Promise<void> => {
      bootstrap.start();
      post = new Post();
      post.title = 'snapshot-test';
      const newPost = await Collection(Post).create(post);
      if (newPost) {
        post = newPost;
      }
    });
  
    afterEach((): void => {
      documentListener();
      Collection(Post).remove(post.id);
      bootstrap.reset();
    });
    it('should receive the initial document', async (): Promise<void> => {
      const result: IDocumentSnapshot<Post> = await new Promise((resolve): void => {
        documentListener = post.ref.onSnapshot((snapshot): void => {
          resolve(snapshot);
        });
      });
      expect(result.exists).to.equal(true);
      expect(result.ref).to.eql(result.doc.ref);
      expect(result.metadata).to.not.be.null.and.not.be.undefined;
    });
    it('should receive updates', async function(): Promise<void> {
      this.timeout(10000);
      const result: IDocumentSnapshot<Post> = await new Promise(async (resolve): Promise<void> => {
        let receivedFirst = false
        documentListener = post.ref.onSnapshot((snapshot): void => {
          if (receivedFirst) {
            resolve(snapshot);
          } else {
            receivedFirst = true;
          }
        });
        post.title = 'snapshot-test-updated';
        // prevent race conditions of receiving second snapshot before first run-through finishes
        setTimeout(async (): Promise<void> => {
          const updatedPost = await Collection(Post).update(post);
          if (updatedPost) {
            post = updatedPost;
          }
        }, 1000);
      });
      expect(result.doc.id).to.eql(post.id);
      expect(result.exists).to.equal(true);
      expect(result.ref).to.eql(result.doc.ref);
      expect(result.metadata).to.not.be.null.and.not.be.undefined;
    });
  });

  describe('on collection queries', (): void => {
    let collection: ICollection<Post>;
    let documentListener: (() =>  void);
    beforeEach((): void => {
      bootstrap.start();
      collection = Collection(Post);
    });
  
    afterEach((): void => {
      documentListener();
      bootstrap.reset();
    });
    it('should receive the initial collection', async (): Promise<void> => {
      const result: IQuerySnapshot<Post> = await new Promise((resolve): void => {
        documentListener = collection.query().onSnapshot((snapshot): void => {
          resolve(snapshot);
        });
      });
      expect(result.size).to.equal(2);
      expect(result.docs.length).to.equal(2);
      const changes = result.docChanges();
      expect(changes.length).to.equal(result.size);
      const query = result.query;
      expect(query).to.eql(collection.query());
      result.forEach((doc, i): void => {
        expect(doc).to.be.eql(result.docs[i]);
      });
      expect(result.metadata).to.not.be.null.and.to.not.be.undefined;
    });
  })
});