import * as bootstrap from '../../test/bootstrap.spec';
import chai, { expect } from 'chai';
import 'mocha';
import { Collection, GeoPoint, ICollection } from '../../src';
import Post from '../entities/Post';
import chaiAsPromised from 'chai-as-promised';
import Author from '../entities/Author';
import { Timestamp } from '../../src/fields';
import AuthorPreferences from '../entities/AuthorPreferences';

chai.use(chaiAsPromised);

describe('[functional] querying data', (): void => {
  let docId: string;
  let collectionRef: ICollection<Post>;

  before((): void => {
    bootstrap.start();
    docId = 'hello-world';
    collectionRef = Collection(Post);
  });

  after((): void => {
    bootstrap.reset();
  });

  const createDocument = async (id?: string): Promise<void> => {
    const title = 'Simple Collections Integration';
    const body = 'This document was created using the integration test';
    const post = new Post();
    if (id) post.id = id;
    post.title = title;
    post.body = body;
    post.author = Collection(Author).doc('john-doe');
    const newPost = await Collection(Post).create(post);
    expect(newPost).to.not.be.null;
    if (newPost) {
      expect(newPost).include.keys('id');
      if (id) {
        expect(newPost.id).to.equal(id);
      }
      expect(newPost.title).to.equal(title);
      expect(newPost.body).to.equal(body);
      expect(newPost.posted).to.not.be.null.and.to.not.be.undefined;
      await Collection(Post).remove(newPost.id);
    }
  }
  it('creating document without id should create doc with generated id', async (): Promise<void> => {
    await createDocument();
  });
  it('creating document with id should create doc with id', async (): Promise<void> => {
    await createDocument('manual-id');
  });
  it('create author document with geopoint', async (): Promise<void> => {
    const name = 'Jane Doe';
    const location = new GeoPoint(40.7128, -74.006);
    const previousLocations = [
      new GeoPoint(0, 0),
      new GeoPoint(1, 1),
      new GeoPoint(2, 2),
    ];
    const author = new Author();
    author.name = name;
    author.location = location;
    author.previousLocations = previousLocations;
    const newAuthor = await Collection(Author).create(author);
    expect(newAuthor).to.not.be.null;
    if (newAuthor) {
      expect(newAuthor.name).to.equal(name);
      expect(newAuthor.location.latitude).to.equal(location.latitude);
      expect(newAuthor.location.longitude).to.equal(location.longitude);
      await Collection(Author).remove(newAuthor.id);
    }
  });
  it('create author with map', async (): Promise<void> => {
    const name = 'Jane Doe';
    const author = new Author();
    author.name = name;
    const authorPreferences = new AuthorPreferences();
    authorPreferences.receivePushNotifications = true;
    author.metadata = authorPreferences;
    const newAuthor = await Collection(Author).create(author);
    expect(newAuthor).to.not.be.null;
    if (newAuthor) {
      expect(newAuthor.name).to.equal(name);
      expect(newAuthor.metadata).to.not.be.undefined.and.to.not.be.null;
      expect(newAuthor.metadata.receivePushNotifications).to.be.true;
      await Collection(Author).remove(newAuthor.id);
    }
  });
  const updateDocument = async (id?: string): Promise<void> => {
    const title = 'Simple Collections Integration Updated';
    const body = 'This document was created using the integration test';
    const post = new Post();
    post.title = title;
    post.body = body;
    post.posted = Timestamp.fromMillis(0);
    if (id) {
      post.id = id;
      await Collection(Post).create(post);
      const updatedPost = await Collection(Post).update(post);
      expect(updatedPost).to.not.be.null;
      if (updatedPost) {
        expect(updatedPost).include.keys('id');
        if (id) {
          expect(updatedPost.id).to.equal(id);
        }
        expect(updatedPost.title).to.equal(title);
        expect(updatedPost.body).to.equal(body);
        expect(updatedPost.posted.isEqual(Timestamp.fromMillis(0))).to.be.true;
      }
      await Collection(Post).remove(id);
    } else {
      await expect(Collection(Post).update(post)).to.be.rejectedWith(Error);
    }
  };
  it('updating document without id should throw an error, id must be provided', async (): Promise<void> => {
    await updateDocument();
  });
  it('updating document with id should update doc with id', async (): Promise<void> => {
    await updateDocument('manual-id');
  });
  it('undefinedAuthorRefGetCached', async (): Promise<void> => {
    const post = await collectionRef.get(docId);
    if (post) expect((): Author | null => post.author.cached).to.throw(Error);
  });
  it('remove document should return null when fetched again', async (): Promise<void> => {
    await createDocument('removed');
    await collectionRef.remove('removed');
    const post = await collectionRef.get('removed');
    expect(post).to.be.null;
  });
});