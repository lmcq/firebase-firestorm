import * as bootstrap from '../../test/bootstrap.spec';
import chai, { expect } from 'chai';
import 'mocha';
import { Collection, ICollection } from '../../src';
import Post from '../entities/Post';
import chaiAsPromised from 'chai-as-promised';
import fixture from '../fixture';
import Author from '../entities/Author';
import Comment from '../entities/Comment';
import { firestore as firestoreTypes } from 'firebase/app';

chai.use(chaiAsPromised);

describe('[functional] querying data', (): void => {
  let docId: string;
  let collectionRef: ICollection<Post>;
  let firestore: firestoreTypes.Firestore;
  before((): void => {
    bootstrap.start();
    docId = 'hello-world';
    collectionRef = Collection(Post);
    firestore = bootstrap.getFirestore();
  });
  after((): void => {
    bootstrap.reset();
  });

  /**
   * Tests with simple collections (root only)
   */
  describe('simple collection', (): void => {
    it('get post should match fixture', async (): Promise<void> => {
      const post = await collectionRef.get(docId);
      expect(post).to.not.be.null;
      if (post) {
        expect(post.id).to.equal(docId);
        expect(post.title).to.equal('Hello World!')
        expect(post.body).to.eql('This is an example post.');
      }
    });
    it('get post data should match fixture data', async (): Promise<void> => {
      const post = await collectionRef.get(docId);
      expect(post).to.not.be.null;
      if (post) {
        expect(post.toData()).to.eql({
          id: 'hello-world',
          title: 'Hello World!',
          body: 'This is an example post.',
          posted: (new Date(0).toLocaleString())
        });
      }
    });
    it('get all posts should match fixture data', async (): Promise<void> => {
      const fixturesPost = Object.keys(fixture.__collection__.posts.__doc__);
      const posts = await collectionRef.find();
      expect(posts.length).to.eql(fixturesPost.length);
    });
    it('find with where should match fixture data', async (): Promise<void> => {
      const posts = await collectionRef.find({
        where: [
          ['title', '==', 'Hello World!']
        ],
      });
      const post = posts[0];
      expect(post.title).to.equal('Hello World!');
      expect(post.body).to.equal('This is an example post.');
    });
  });

  /**
   * Tests with document references
   */
  describe('with document reference', (): void => {
    it('get post w/ author should match fixture data', async (): Promise<void> => {
      const post = await collectionRef.get(docId);
      expect(post).to.not.be.null;
      if (post) {
        await post.author.get();
        expect(post.toData()).to.eql({
          id: 'hello-world',
          title: 'Hello World!',
          body: 'This is an example post.',
          posted: (new Date(0).toLocaleString()),
          author: {
            id: 'john-doe',
            name: 'John Doe',
            location: {
              latitude: 40.7128,
              longitude: -74.006,
            },
            previousLocations: [{
              latitude: 36.7783,
              longitude: -119.4179,
            }],
            metadata: {
              receivePushNotifications: true,
              lastSignIn: (new Date(0)).toLocaleString(),
            },
            favoritedComments: [],
          }
        });
      }
    });
    it('get author with array of fetched doc refs to match fixture data', async (): Promise<void> => {
      const author = await Collection(Author).get('john-doe');
      if (author) {
        await Promise.all(author.favoritedComments.map((favoritedComment): any => {
          return favoritedComment.get();
        }));
        expect(author.toData()).to.eql({
          id: 'john-doe',
          name: 'John Doe',
          location: {
            latitude: 40.7128,
            longitude: -74.006,
          },
          previousLocations: [{
            latitude: 36.7783,
            longitude: -119.4179,
          }],
          metadata: {
            receivePushNotifications: true,
            lastSignIn: (new Date(0)).toLocaleString(),
          },
          favoritedComments: [
            {
              id: 'comment-1',
              by: 'Michael',
              content: 'Wow, thanks!',
            }
          ]
        });
      }
    });
  });

  /**
   * Tests with subcollections
   */
  describe('with subcollections', (): void => {
    it('comments collection path should match firestore path', (): void => {
      const commentsRef = collectionRef.doc(docId).collection(Comment);
      expect(commentsRef).to.not.be.null;
      expect(commentsRef.native.path).to.eql(firestore.collection('posts/hello-world/comments').path);
    });
    it('get all comments should match fixture data', async (): Promise<void> => {
      const commentsRef = collectionRef
        .doc('hello-world')
        .collection(Comment);
      expect(commentsRef).to.not.be.null;
      const commentsSnap = await commentsRef.find();
      if (commentsSnap) {
        expect(commentsSnap.length).to.equal(1);
        expect(commentsSnap[0].id).to.equal('comment-1');
        expect(commentsSnap[0].content).to.equal('Wow, thanks!');
        expect(commentsSnap[0].by).to.equal('Michael');
      } else {

      }
    });
  });
});