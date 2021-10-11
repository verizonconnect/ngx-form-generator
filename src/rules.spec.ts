/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import { requiredRule, patternRule, minLengthRule, maxLengthRule, Definition, minimumRule, maximumRule } from './rules';

describe('rules', () => {
  let definition: Partial<Definition>;

  beforeEach(() => {
    definition = {
      required: [],
      properties: {
        foo: {}
      }
    };
  });

  describe('requiredRule', () => {
    it('should add the required validator if the field is required', () => {
      definition.required!.push('foo');

      const result = requiredRule('foo', definition as Definition);

      expect(result).toEqual('Validators.required');
    });

    it('should should not add the required validator if the field is required', () => {
      const result = requiredRule('foo', definition as Definition);

      expect(result).toBeFalsy();
    });
  });

  describe('patternRule', () => {
    it('should add the pattern validator if the field contains a pattern', () => {
      definition.properties!.foo.pattern = '[A-Z]{2}';

      const result = patternRule('foo', definition as Definition);

      expect(result).toEqual('Validators.pattern(/[A-Z]{2}/)');
    });

    it('should not add the pattern validator if the field contains a pattern', () => {
      const result = patternRule('foo', definition as Definition);

      expect(result).toBeFalsy();
    });
  });

  describe('minLengthRule', () => {
    it('should add the minLength validator if the field contains a minLength', () => {
      definition.properties!.foo.minLength = 1;

      const result = minLengthRule('foo', definition as Definition);

      expect(result).toEqual('Validators.minLength(1)');
    });

    it('should add the minLength validator if the field contains a minLength', () => {
      const result = minLengthRule('foo', definition as Definition);

      expect(result).toBeFalsy();
    });
  });

  describe('maxLengthRule', () => {
    it('should add the maxLength validator if the field contains a minLength', () => {
      definition.properties!.foo.maxLength = 1;

      const result = maxLengthRule('foo', definition as Definition);

      expect(result).toEqual('Validators.maxLength(1)');
    });

    it('should add the maxLength validator if the field contains a minLength', () => {
      const result = maxLengthRule('foo', definition as Definition);

      expect(result).toBeFalsy();
    });
  });

  describe('minimumRule', () => {
    it('should add the minimum validator if the field contains a minimum', () => {
      definition.properties!.foo.minimum = 1;

      const result = minimumRule('foo', definition as Definition);

      expect(result).toEqual('Validators.min(1)');
    });

    it('should not add the minimum validator is the field does not contain a minimum', () => {
      const result = minimumRule('foo', definition as Definition);

      expect(result).toBeFalsy();
    });
  });

  describe('maximumRule', () => {
    it('should add the maximum validator if the field contains a maximum', () => {
      definition.properties!.foo.maximum = 1;

      const result = maximumRule('foo', definition as Definition);

      expect(result).toEqual('Validators.max(1)');
    });

    it('should not add the maximum validator is the field does not contain a maximum', () => {
      const result = maximumRule('foo', definition as Definition);

      expect(result).toBeFalsy();
    });
  });
});
