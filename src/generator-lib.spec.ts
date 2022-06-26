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
            bar: {},
            barArrays: {
              type: 'array',
              minItems: 2,
              maxItems: 5,
              items: {
                type: 'string',
                minLength: 1,
                maxLength: 5,
              }
            },
            barGroup: {
              type: 'object',
              required: ['innerBar'],
              properties: {
                innerBar: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 5,
                  default: 'bar'
                },
                innerFoo: {
                  type: 'string',
                  maxLength: 30,
                },
              }
            }
          }
        }
      }
    } as Partial<OpenAPI.Document>) as OpenAPI.Document;
  });

  describe('makeFile', () => {
    it('should create typescript file with angular imports', () => {
      const result = makeForm(spec);

      expect(result).toContain(`import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';`);
    });

    it('should create typescript file with an export for the definition', () => {
      const result = makeForm(spec);

      expect(result).toContain(`export const fooForm = new FormGroup({`);
    });

    it('should create a FormControl', () => {
      const result = makeForm(spec);

      expect(result).toContain(`bar: new FormControl(null, [Validators.required])`);
    });

    it('should create form array', () => {
      const result = makeForm(spec);

      expect(result).toContain(`barArrays: new FormArray([`);
    });

    it('should create number of childs based on minItems', () => {
      const result = makeForm(spec);

      expect(result).toContain(`([
    new FormControl(null, [Validators.minLength(1), Validators.maxLength(5)]),
    new FormControl(null, [Validators.minLength(1), Validators.maxLength(5)])
  ]`);
    });

    it('should create only one child if minItems is not specified', () => {
      delete (spec as any).definitions.foo.properties.barArrays.minItems;
      const result = makeForm(spec);

      expect(result).toContain(`[
    new FormControl(null, [Validators.minLength(1), Validators.maxLength(5)])
  ]`);
    });

    it('should create form array of form group', () => {
      (spec as any).definitions.foo.properties.barGroupArrays = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            dummyFoo: {
              type: 'string',
              default: 'foo',
              minLength: 1
            },
            dummaryBar: {
              type: 'string',
              default: 'bar',
              minLength: 2
            }

          }
        }
      }

      const result = makeForm(spec);

      expect(result).toContain(`barGroupArrays: new FormArray([
    new FormGroup({
      dummyFoo: new FormControl('foo', [Validators.minLength(1)]),
      dummaryBar: new FormControl('bar', [Validators.minLength(2)])
    }),
    new FormGroup({
      dummyFoo: new FormControl('foo', [Validators.minLength(1)]),
      dummaryBar: new FormControl('bar', [Validators.minLength(2)])
    })
  ])`)
  })


  it('should create nested form group', () => {
    const result = makeForm(spec);

    expect(result).toContain(`barGroup: new FormGroup({`);
  });

  it('should create nested child control with validation', () => {
    const result = makeForm(spec);
    expect(result).toContain(`innerBar: new FormControl('bar', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(5)
    ]),`);
    expect(result).toContain(`innerFoo: new FormControl(null, [Validators.maxLength(30)])`);
  });

  it('should create a deep nested form group with nested child control', () => {
      (spec as any).definitions.foo.properties.barGroup.properties.dummyGroup = {
        type: 'object',
        required: ['dummyBar'],
        properties: {
          dummyBar: {
            type: 'string',
            minLength: 1
          },
          dummyFoo: {
            type: 'string',
            minLength: 3,
            maxLength: 5,
            default: 'dummy'
          }
        }
      };
      const result = makeForm(spec);
      expect(result).toContain(`dummyGroup: new FormGroup({
      dummyBar: new FormControl(null, [
        Validators.required,
        Validators.minLength(1)
      ]),
      dummyFoo: new FormControl('dummy', [
        Validators.minLength(3),
        Validators.maxLength(5)
      ])
    })`);
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
