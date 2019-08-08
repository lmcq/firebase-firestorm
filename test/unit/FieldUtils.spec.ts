import { expect } from 'chai';
import 'mocha';
import * as bootstrap from '../../test/bootstrap.spec';
import FieldUtils from '../../src/utils/FieldUtils';
import { FieldTypes, FieldConversionType } from '../../src';

describe('[unit] FieldUtils', () => {
  // Configure() function tests.
  describe('#configure()', () => {
    describe('field name is provided', () => {
      for (const fieldType in FieldTypes) {
        const type = FieldTypes[fieldType] as any as FieldTypes;
        const result = FieldUtils.configure({ name: 'TEST-FIELD-NAME' }, 'testFieldName', '', type);
        describe(`with field type ${fieldType}`, () => {
          it('name should be provided name', () => { expect(result.name).to.equal('TEST-FIELD-NAME'); });
          it('type should match', () => { expect(result.type).to.equal(type); });
          it('should not be an array', () => { expect(result.isArray).to.equal(false); });
          it('field functions should be return null (uninitialised)', () => {
            expect(result.deserialize(null)).to.be.null;
            expect(result.serialize(null)).to.be.null;
            expect(result.toData(null)).to.be.null;
          });
        });
      }
    });
    describe('field name is determined by firestorm config', () => {
      const run = (conversationType: FieldConversionType, expectedNameVal: string) => {
        bootstrap.start({
          fieldConversion: conversationType,
        });
        const type = FieldTypes.Standard as any as FieldTypes;
        const result = FieldUtils.configure({}, 'test-field-name', '',type);
        it('name should have converted name value', () => { expect(result.name).to.equal(expectedNameVal); });
      };
      [
        [FieldConversionType.NoConversion, 'test-field-name'],
        [FieldConversionType.ToCamelCase, 'testFieldName'],
        [FieldConversionType.ToKebabCase, 'test-field-name'],
        [FieldConversionType.ToSnakeCase, 'test_field_name'],
      ].forEach(([conversionType, expectedValue]) => {
        describe(`with conversion type ${conversionType}`, () => {
          run(conversionType as FieldConversionType, expectedValue);
        });
      });
    });
  });
  // Process() function tests.
  describe('#process()', () => {
    it('running processor on a single value should apply to the value', () => {
      const result = FieldUtils.process(false, 1, (value: number) => value + 1);
      expect(result).to.equal(2);
    });
    it('running processor on an array should apply to all array values', () => {
      const result = FieldUtils.process(true, [1, 2], (value: number) => value + 1);
      expect(result).to.eql([2, 3]);
    });
  });
});