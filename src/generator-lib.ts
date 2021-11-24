/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import { Project } from 'ts-morph';
import prettier from 'prettier';
import camelcase from 'camelcase';
import {
  requiredRule,
  patternRule,
  minLengthRule,
  maxLengthRule,
  emailRule,
  minimumRule,
  maximumRule,
  Definition,
  Rule, minItemsRule, maxItemsRule
} from './rules';
import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';

const DEFAULT_RULES = [requiredRule, patternRule, minLengthRule, maxLengthRule, emailRule, minimumRule, maximumRule, minItemsRule, maxItemsRule];

let rules: Rule[] = [...DEFAULT_RULES];

export function addRule(rule: Rule): void {
  rules.push(rule);
}

export function resetRules(): void {
  rules = [...DEFAULT_RULES];
}

export function makeFileName(swagger: OpenAPI.Document): string | undefined {
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

function makeControl(fieldName: string, definition: Definition): string {
  if (definition.properties[fieldName].hasOwnProperty('type') &&
    definition.properties[fieldName]['type'] === "array") {
    return makeArray(fieldName, definition);
  }
  return makeField(fieldName, definition);
}

function makeField(fieldName: string, definition: Definition): string {
  return `${fieldName}: new FormControl(null, [${makeFieldRules(fieldName, definition)}])`;
}

function makeArray(fieldName: string, definition: Definition): string {
  return `${fieldName}: new FormArray(null, [${makeFieldRules(fieldName, definition)}])`;
}

function makeFieldsBody(definition: Definition): string[] {
  if ('allOf' in definition) {
    const definitionKeys = Object.keys(definition.allOf);
    const allOfFieldsBody = definitionKeys
      .map(key => makeFieldsBody(definition.allOf[key]))
      .reduce((acc, val) => acc.concat(val), []);

    return allOfFieldsBody;
  }
  if(!definition.properties)
    return [];
  const fields = Object.keys(definition.properties);
  const fieldsBody = fields.map(fieldName => makeControl(fieldName, definition)).filter(item => item !== '');

  return fieldsBody;
}

function makeDefinition(definitionName: string, definition: Definition): string {
  const fieldsBody = makeFieldsBody(definition);
  return `
    export const ${camelcase(definitionName)}Form = new FormGroup({
      ${fieldsBody}
    });
    `;
}

function makeHeader(body: string): string {
  return `import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

  ${body}`;
}

export function makeForm(spec: OpenAPI.Document): string {
  let definitions: OpenAPIV2.DefinitionsObject | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
  if ('definitions' in spec) {
    definitions = spec.definitions;
  } else if ('components' in spec) {
    definitions = spec.components?.schemas;
  } else {
    throw new Error('Cannot find schemas/definitions');
  }

  if (!definitions) {
    throw new Error('Cannot find schemas/definitions');
  }

  const definitionKeys = Object.keys(definitions);

  const forms = definitionKeys
    .map(key => makeDefinition(key, (definitions as Record<string, Definition>)[key]))
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

export async function loadSpec(fileOrUrlPath: string): Promise<OpenAPI.Document> {
  const parser = new SwaggerParser();

  return parser.dereference(fileOrUrlPath);
}
