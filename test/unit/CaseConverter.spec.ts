import { expect } from 'chai';
import 'mocha';
import {
  CaseConverter,
} from '../../src/utils';

interface ITestString {
  raw: string;
  camel: string,
  snake: string,
  kebab: string;
}

const testStrings : Array<ITestString> = [{
  raw: 'thisIsATest',
  camel: 'thisIsATest',
  snake: 'this_is_a_test',
  kebab: 'this-is-a-test',
}, {
  raw: 'ThisIsATest',
  camel: 'thisIsATest',
  snake: 'this_is_a_test',
  kebab: 'this-is-a-test',
}, {
  raw: '',
  camel: '',
  snake: '',
  kebab: '',
}];

describe('[unit] CaseConverter', () => {
  it('camel2snake should convert valid camelCase string to snake_case', function() {
    testStrings.forEach((str) => {
      const result = CaseConverter.camelToSnakeCase(str.raw);
      expect(result).equal(str.snake);
    });
  }); 
  it('camel2Kebab should convert valid camelCase string to kebab-case', () => {
    testStrings.forEach((str) => {
      const result = CaseConverter.camelToKebabCase(str.raw);
      expect(result).equal(str.kebab);
    });
  });
  it('snake2Camel should convert valid snake_case to camelCase', () => {
    testStrings.forEach((str) => {
      const result = CaseConverter.toCamelCase(str.raw);
      expect(result).equal(str.camel);
    });
  });
  it('kebab2Camel should convert valid kebab-case to camelCase', () => {
    testStrings.forEach((str) => {
      const result = CaseConverter.toCamelCase(str.raw);
      expect(result).equal(str.camel);
    });
  });
});