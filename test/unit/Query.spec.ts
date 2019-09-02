import { firestore } from 'firebase/app';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import {
  Collection,
  ICollection,
  IQuery,
} from '../../src';

import * as bootstrap from '../bootstrap.spec';
import Post from '../entities/Post';

chai.use(chaiAsPromised);

describe('[unit] Query', (): void => {
  let postCollection: ICollection<Post>;
  let baseQuery: IQuery<Post>;
  let firestoreQuery: firestore.Query;
  beforeEach((): void => {
    postCollection = Collection(Post);
    baseQuery = postCollection.query();
    firestoreQuery = bootstrap.getFirestore().collection('posts');
  })
  describe('methods', (): void => {
    const isQueryResultEqual = async (firestormQuery: IQuery<Post>, firestoreQuery: firestore.Query): Promise<boolean> => {
      const firestormResult = await firestormQuery.get();
      const firestoreResult = await firestoreQuery.get();
      let docCounter = 0;
      return (
        firestoreResult.docs.length === firestormResult.docs.length
        && firestormResult.docs.reduce((prev: any, curr: Post): boolean => {
          const matches = prev && curr.id === firestoreResult.docs[docCounter].id;
          docCounter += 1;
          return matches;
        }, true)
      );
    }
    describe('#where', (): void => {
      it('should match firestore result', async (): Promise<void> => {
        const isEqual = await isQueryResultEqual(
          baseQuery.where('title', '==', 'hello-world'),
          firestoreQuery.where('title', '==', 'hello-world'),
        );
        expect(isEqual).to.be.true;
      });
      it('should throw an error for an unregistered field', (): void => {
        expect((): IQuery<Post> => baseQuery.where('unregistered' as keyof Post, '==', 'hello-world')).to.throw(Error);
      });
    });
    describe('#orderBy', (): void => {
      it('should match firestore result', async (): Promise<void> => {
        const isEqual = await isQueryResultEqual(
          baseQuery.orderBy('title'),
          firestoreQuery.orderBy('title'),
        );
        expect(isEqual).to.be.true;
      });
      it('should throw an error for an unregistered field', (): void => {
        expect((): IQuery<Post> => baseQuery.orderBy('unregistered' as keyof Post)).to.throw(Error);
      });
    });
    describe('#limit', (): void => {
      it('should match firestore result', async (): Promise<void> => {
        const isEqual = await isQueryResultEqual(
          baseQuery.limit(1),
          firestoreQuery.limit(1),
        );
        expect(isEqual).to.be.true;
      });
    });
    describe('#startAt', (): void => {
      it('should match firestore result', async (): Promise<void> => {
        const isEqual = await isQueryResultEqual(
          baseQuery.orderBy('title').startAt('hello-world'),
          firestoreQuery.orderBy('title').startAt('hello-world'),
        );
        expect(isEqual).to.be.true;
      });
    });
    describe('#startAfter', (): void => {
      it('should match firestore result', async (): Promise<void> => {
        const isEqual = await isQueryResultEqual(
          baseQuery.orderBy('title').startAfter('hello-world'),
          firestoreQuery.orderBy('title').startAfter('hello-world'),
        );
        expect(isEqual).to.be.true;
      });
    });
    describe('#endAt', (): void => {
      it('should match firestore result', async (): Promise<void> => {
        const isEqual = await isQueryResultEqual(
          baseQuery.orderBy('title').endAt('hello-world'),
          firestoreQuery.orderBy('title').endAt('hello-world'),
        );
        expect(isEqual).to.be.true;
      });
    });
    describe('#endBefore', (): void => {
      it('should match firestore result', async (): Promise<void> => {
        const isEqual = await isQueryResultEqual(
          baseQuery.orderBy('title').endBefore('hello-world'),
          firestoreQuery.orderBy('title').endBefore('hello-world'),
        );
        expect(isEqual).to.be.true;
      });
    });
  });
});