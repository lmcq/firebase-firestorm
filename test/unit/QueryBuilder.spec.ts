import { Firestore } from '@google-cloud/firestore';
import { expect } from 'chai';
import 'mocha';
import { Collection } from '../../src';
import { QueryBuilder } from '../../src/utils'; 

import * as bootstrap from '../../test/bootstrap.spec';
import Post from '../../test/entities/Post';

describe('[unit] QueryBuilder', () => {
  let firestore : Firestore;

  beforeEach(() => {
    bootstrap.start();
    firestore = bootstrap.getFirestore();
  });

  afterEach(() => {
    bootstrap.reset();
  });

  describe('where queries', () => {
    it('empty where should match firestore base collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        where: [],
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
    });
    it('undefined where should match firestore base collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {});
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
    });
    it('single where should match firestore collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        where: [
          ['title', '==', 'test'],
        ],
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
    });
    it('chain where should match firestore collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        where: [
          ['title', '==', 'test'],
          ['body', '==', 'test'],
        ],
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
    });
  });
  
  describe('order by queries', () => {
    describe('single order by should match firestore collection query', () => {
      it('with implicit order direction', async () => {
        const query = QueryBuilder.query(Collection(Post), {
          orderBy: [
            ['title'],
          ],
        });
        const firestormResults = await query.get();
        const firestoreResults = await query.get();
        expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
      });
      it('with explicit order direction', async () => {
        const query = QueryBuilder.query(Collection(Post), {
          orderBy: [
            ['title', 'asc'],
          ],
        });
        const firestormResults = await query.get();
        const firestoreResults = await query.get();
        expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
      });
    })
  });

  describe('startAt/startAfter queries', () => {
    it('startAt query should match firestore collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        orderBy: [
          ['title', 'desc']
        ],
        startAt: 'Hello World!',
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestormResults.docs.length).to.eql(2);
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
    });
    it('startAfter query should match firestore collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        orderBy: [
          ['title', 'desc']
        ],
        startAfter: 'Hello World!',
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestormResults.docs.length).to.equal(1);
      expect(firestoreResults.docs.length).to.equal(firestormResults.docs.length);
    });
    it('using startAt and startAfter should use startAt', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        orderBy: [
          ['title', 'desc']
        ],
        startAt: 'Hello World!',
        startAfter: 'Hello World!',
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestormResults.docs.length).to.eql(2);
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);

    });
  });

  describe('endAt/endBefore queries', () => {
    it('endAt query should match firestore collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        orderBy: [
          ['title', 'desc']
        ],
        endAt: 'Hello World!',
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestormResults.docs.length).to.eql(1);
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
    });
    it('endBefore query should match firestore collection query', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        orderBy: [
          ['title', 'desc']
        ],
        endBefore: 'Hello World!',
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestormResults.docs.length).to.equal(0);
      expect(firestoreResults.docs.length).to.equal(firestormResults.docs.length);
    });
    it('using endAt and endBefore should use endAt', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        orderBy: [
          ['title', 'desc']
        ],
        endAt: 'Hello World',
        endBefore: 'Hello World',
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestormResults.docs.length).to.eql(2);
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);

    });
  });

  describe('limit query', () => {
    it('should limit results', async () => {
      const query = QueryBuilder.query(Collection(Post), {
        limit: 1,
      });
      const firestormResults = await query.get();
      const firestoreResults = await query.get();
      expect(firestormResults.docs.length).to.eql(1);
      expect(firestoreResults.docs.length).to.eql(firestormResults.docs.length);
    });
  });

});