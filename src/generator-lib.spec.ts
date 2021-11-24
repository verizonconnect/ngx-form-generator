/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { makeForm, makeFileName, addRule, resetRules, loadSpec } from './generator-lib';
import { Definition, Rule } from './rules';

describe('generator-lib ', () => {
  let spec: OpenAPI.Document;

  beforeEach(() => {
    spec = ({
      definitions: {
        foo: {
          required: ['bar'],
          properties: {
            bar: {}
          }
        }
      }
    } as Partial<OpenAPI.Document>) as OpenAPI.Document;
  });

  describe('makeFile', () => {
    it('should create typescript file with angular imports', () => {
      const result = makeForm(spec);

      expect(result).toContain(`import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms`);
    });

    it('should create typescript file with an export for the definition', () => {
      const result = makeForm(spec);

      expect(result).toContain(`export const fooForm = new FormGroup({`);
    });

    it('should create a FormControl', () => {
      const result = makeForm(spec);

      expect(result).toContain(`bar: new FormControl(null, [Validators.required])`);
    });
  });

  describe('makeFileName', () => {
    it('should return undefined if no title is in the swagger', () => {
      const result = makeFileName(spec);

      expect(result).toBeUndefined();
    });

    it('should return camelized.ts file name if title exits', () => {
      spec.info = { title: 'Foo bar_baz', version: '' };

      const result = makeFileName(spec);

      expect(result).toEqual('fooBarBaz.ts');
    });
  });

  describe('allOf', () => {
    it('should generate form using allOf polymorphism', async () => {
      spec = await loadSpec('src/fixtures/pets.json');

      const result = makeForm(spec);

      expect(result.match(/petType:/g)?.length).toEqual(3);
    });
  });
});

describe('generator-lib openApi2', () => {
  let spec: OpenAPIV2.Document;

  beforeEach(() => {
    spec = ({
      definitions: {
        foo: {
          required: ['bar'],
          properties: {
            bar: {}
          }
        }
      }
    } as Partial<OpenAPIV2.Document>) as OpenAPIV2.Document;
  });

  afterEach(() => resetRules());

  describe('addRule', () => {
    beforeEach(() => {
      (spec as any).definitions.foo.properties.bar.format = 'baz';
      (spec as any).definitions.foo.required = [];
    });

    const bazRule: Rule = (fieldName: string, definition: Definition) => {
      return definition.properties[fieldName].format === 'baz' ? `Validators.pattern(/baz/)` : '';
    };

    it('should generate an added rule', () => {
      addRule(bazRule);

      const result = makeForm(spec);

      expect(result).toContain(`bar: new FormControl(null, [Validators.pattern(/baz/)])`);
    });
  });
});

describe('generator-lib openApi3', () => {
  let spec: OpenAPIV3.Document;

  beforeEach(() => {
    spec = ({
      components: {
        schemas: {
          foo: {
            required: ['bar'],
            properties: {
              bar: {}
            }
          }
        }
      }
    } as Partial<OpenAPIV3.Document>) as OpenAPIV3.Document;
  });

  afterEach(() => resetRules());

  describe('addRule', () => {
    beforeEach(() => {
      (spec as any).components.schemas.foo.properties.bar.format = 'baz';
      (spec as any).components.schemas.foo.required = [];
    });

    const bazRule: Rule = (fieldName: string, definition: Definition) => {
      return definition.properties[fieldName].format === 'baz' ? `Validators.pattern(/baz/)` : '';
    };

    it('should generate an added rule', () => {
      addRule(bazRule);

      const result = makeForm(spec);

      expect(result).toContain(`bar: new FormControl(null, [Validators.pattern(/baz/)])`);
    });
  });
});
