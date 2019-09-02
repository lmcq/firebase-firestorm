import { firestore } from 'firebase/app';
import { expect } from 'chai';
import 'mocha';
import {
  Timestamp,
} from '../../src';

describe('[unit] Timestamp', (): void => {
  it('should get correct seconds & nanoseconds when valid', (): void => {
    const timestamp = new Timestamp(1000, 100);
    const fsTimestamp = new firestore.Timestamp(1000, 100);
    expect(timestamp.seconds).to.equal(fsTimestamp.seconds);
    expect(timestamp.nanoseconds).to.equal(fsTimestamp.nanoseconds);
  });
  it('should get correct seconds & nanoseconds when using fromDate', (): void => {
    const timestamp = Timestamp.fromDate(new Date(1000000));
    const fsTimestamp = new firestore.Timestamp(1000, 0);
    expect(timestamp.seconds).to.equal(fsTimestamp.seconds);
    expect(timestamp.nanoseconds).to.equal(fsTimestamp.nanoseconds);
  });
  it('should get correct seconds & nanoseconds when using fromMillis', (): void => {
    const timestamp = Timestamp.fromMillis(1000000);
    const fsTimestamp = new firestore.Timestamp(1000, 0);
    expect(timestamp.seconds).to.equal(fsTimestamp.seconds);
    expect(timestamp.nanoseconds).to.equal(fsTimestamp.nanoseconds);
  });
  it('should get correct date when using toDate', (): void => {
    const timestamp = Timestamp.fromMillis(100);
    const date = timestamp.toDate();
    expect(date.toUTCString()).to.equal(new Date(100).toUTCString())
  });
  it('should get correct date when using toMillis', (): void => {
    const timestamp = new Timestamp(1, 0);
    expect(timestamp.toMillis()).to.equal(1000);
  });
  it('timestamps from millis and dates should be equal using isEqual method', (): void => {
    const dateTs = Timestamp.fromDate(new Date(1));
    const milliTs = Timestamp.fromMillis(1);
    expect(dateTs.isEqual(milliTs)).to.be.true;
  });
});