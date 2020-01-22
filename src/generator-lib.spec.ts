/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import {
  OpenApi2,
  makeForm,
  makeFileName,
  addRule,
  Rule,
  Definition,
  OpenApi3,
  OpenApi,
  resetRules
} from './generator-lib';

describe('generator-lib ', () => {
  let spec: OpenApi;

  beforeEach(() => {
    spec = {
      definitions: {
        foo: {
          required: ['bar'],
          properties: {
            bar: {}
          }
        }
      }
    };
  });

  describe('makeFile', () => {
    it('should create typescript file with angular imports', () => {
      const result = makeForm(spec);

      expect(result).toContain(`import { FormGroup, FormControl, Validators } from '@angular/forms';`);
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
      spec.info = { title: 'Foo bar_baz' };

      const result = makeFileName(spec);

      expect(result).toEqual('fooBarBaz.ts');
    });
  });
});

describe('generator-lib openApi2', () => {
  let spec: OpenApi2;

  beforeEach(() => {
    spec = {
      definitions: {
        foo: {
          required: ['bar'],
          properties: {
            bar: {}
          }
        }
      }
    };
  });

  afterEach(() => resetRules());

  describe('addRule', () => {
    beforeEach(() => {
      spec.definitions.foo.properties.bar.format = 'baz';
      spec.definitions.foo.required = [];
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
  let spec: OpenApi3;

  beforeEach(() => {
    spec = {
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
    };
  });

  afterEach(() => resetRules());

  describe('addRule', () => {
    beforeEach(() => {
      spec.components.schemas.foo.properties.bar.format = 'baz';
      spec.components.schemas.foo.required = [];
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
