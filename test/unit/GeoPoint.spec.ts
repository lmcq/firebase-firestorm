import { expect } from 'chai';
import 'mocha';
import {
  GeoPoint
} from '../../src';

describe('[unit] GeoPoint', () => {
  it('should get correct latitude & longitude when valid', async () => {
    const geopoint = new GeoPoint(0, 0);
    expect(geopoint.latitude).to.equal(0);
    expect(geopoint.longitude).to.equal(0);
  });
  it('should update latitude/longitude when using setters', async () => {
    const geopoint = new GeoPoint(0, 0);
    geopoint.latitude = 1;
    geopoint.longitude = 1;
    expect(geopoint.latitude).to.equal(1);
    expect(geopoint.longitude).to.equal(1);
  });
  it('isEqual should be true on equal geopoints', async () => {
    const geopoint = new GeoPoint(0, 0);
    const geopoint1 = new GeoPoint(0, 0);
    expect(geopoint.isEqual(geopoint1)).to.be.true;
  });
  it('isEqual should be flase on non-equal geopoints', async () => {
    const geopoint = new GeoPoint(0, 1);
    const geopoint1 = new GeoPoint(0, 0);
    expect(geopoint.isEqual(geopoint1)).to.be.false;
  });
});