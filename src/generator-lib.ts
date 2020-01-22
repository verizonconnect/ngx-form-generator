/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import Project from 'ts-simple-ast';
import prettier from 'prettier';
import camelcase from 'camelcase';
import { requiredRule, patternRule, minLengthRule, maxLengthRule, emailRule } from './rules';
import fetch from 'node-fetch';
import { cwd } from 'process';
import { join } from 'path';
import YAML from 'yaml';
import { readFileSync } from 'fs';

export type OpenApi2 = {
  definitions: Definitions;
  info?: { title: string };
};

export type OpenApi3 = {
  components: { schemas: Definitions };
  info?: { title: string };
};

export type OpenApi = OpenApi2 | OpenApi3;

export type Definitions = Record<string, Definition>;

export type Definition = {
  required: string[];
  properties: Properties;
};

export type Property = {
  format?: string;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
};

export type Properties = Record<string, Property>;

export type Rule = (fieldName: string, properties: Definition) => string;

const DEFAULT_RULES = [requiredRule, patternRule, minLengthRule, maxLengthRule, emailRule];

let rules: Rule[] = [...DEFAULT_RULES];

export function addRule(rule: Rule): void {
  rules.push(rule);
}

export function resetRules(): void {
  rules = [...DEFAULT_RULES];
}

export function makeFileName(swagger: OpenApi): string | undefined {
  if (swagger.info && swagger.info.title) {
    return `${camelcase(swagger.info.title)}.ts`;
  }
}

function makeFieldRules(fieldName: string, definition: Definition): string {
  return rules
    .map(rule => rule(fieldName, definition))
    .filter(item => item != '')
    .join();
}

function makeField(fieldName: string, definition: Definition): string {
  return `${fieldName}: new FormControl(null, [${makeFieldRules(fieldName, definition)}])`;
}

function makeDefinition(definitionName: string, definition: Definition): string {
  const fields = Object.keys(definition.properties);
  const fieldsBody = fields
    .map(fieldName => makeField(fieldName, definition))
    .filter(item => item !== '')
    .join();

  return `
    export const ${camelcase(definitionName)}Form = new FormGroup({
      ${fieldsBody}
    });
    `;
}

function makeHeader(body: string): string {
  return `import { FormGroup, FormControl, Validators } from '@angular/forms';

  ${body}`;
}

export function makeForm(spec: OpenApi): string {
  let definitions: Definitions;
  if ('definitions' in spec) {
    definitions = spec.definitions;
  } else if ('components' in spec) {
    definitions = spec.components.schemas;
  } else {
    throw new Error('Cannot find schemas/definitions');
  }

  const definitionKeys = Object.keys(definitions);

  const forms = definitionKeys
    .map(key => makeDefinition(key, definitions[key]))
    .filter(item => item != '')
    .join('');

  const file = makeHeader(forms);

  return prettier.format(file, { parser: 'typescript', singleQuote: true });
}

export async function saveFile(file: string, fileName: string): Promise<void> {
  const project = new Project();
  project.createSourceFile(fileName, file, { overwrite: true });
  return project.save();
}

function isYaml(value: string): boolean {
  return /\.ya?ml$/.test(value);
}

function isUrl(value: string): boolean {
  return /^http(s?):\/\//.test(value);
}

async function loadUrl(urlPath: string): Promise<OpenApi> {
  const response = await fetch(urlPath);
  if (isYaml(urlPath)) {
    return Promise.resolve(YAML.parse(await response.text()));
  }

  return response.json();
}

async function loadFile(filePath: string): Promise<OpenApi> {
  if (isYaml(filePath)) {
    const file = readFileSync(filePath, 'utf8');
    return Promise.resolve(YAML.parse(file));
  }

  return Promise.resolve(require(join(cwd(), filePath)));
}

export async function loadSpec(fileOrUrlPath: string): Promise<OpenApi> {
  if (isUrl(fileOrUrlPath)) {
    return loadUrl(fileOrUrlPath);
  } else {
    return loadFile(fileOrUrlPath);
  }
}
