/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import { OpenAPIV2 } from 'openapi-types';

export type openApiProperty = {
  type?: string;
  format?: string;
  pattern?: string;
  max?: number;
  min?: number;
  maxItems?: number;
  minItems?: number;
  maxLength?: number;
  minLength?: number;
  minimum?: number;
  maximum?: number;
};

export type Property = {
  format?: string;
  pattern?: string;
  max?: number;
  min?: number;
  maxLength?: number;
  minLength?: number;
};

export type Properties = Record<string, Property>;

export type Rule = (fieldName: string, properties: Definition) => string;

export type Definition = OpenAPIV2.DefinitionsObject;

function hasMetadata(fieldName: string, definition: Definition, metadataName: string): boolean {
  return definition.properties[fieldName].hasOwnProperty(metadataName);
}

function abstractRule(fieldName: string, definition: Definition, ruleName: keyof Property): string {
  return abstractValidationRule(fieldName, definition, ruleName, ruleName);
}

function abstractValidationRule(fieldName: string, definition: Definition, hasRuleName: keyof openApiProperty, setRuleName: keyof Property): string {
  return hasMetadata(fieldName, definition, hasRuleName)
    ? `Validators.${setRuleName}(${definition.properties[fieldName][hasRuleName]})`
    : '';
}

export function requiredRule(fieldName: string, definition: Definition): string {
  return definition.required && definition.required.includes(fieldName) ? `Validators.required` : '';
}

export function patternRule(fieldName: string, definition: Definition): string {
  return hasMetadata(fieldName, definition, 'pattern')
    ? `Validators.pattern(/${definition.properties[fieldName]['pattern']}/)`
    : '';
}

export function minItemsRule(fieldName: string, definition: Definition): string {
  return abstractValidationRule(fieldName, definition, 'minItems', 'minLength');
}

export function maxItemsRule(fieldName: string, definition: Definition): string {
  return abstractValidationRule(fieldName, definition, 'maxItems', 'maxLength');
}

export function minLengthRule(fieldName: string, definition: Definition): string {
  return abstractRule(fieldName, definition, 'minLength');
}

export function maxLengthRule(fieldName: string, definition: Definition): string {
  return abstractRule(fieldName, definition, 'maxLength');
}

export function emailRule(fieldName: string, definition: Definition): string {
  return definition.properties[fieldName].format === 'email' ? `Validators.email` : '';
}

export function minimumRule(fieldName: string, definition: Definition): string {
  return abstractValidationRule(fieldName, definition, 'minimum', 'min');
}

export function maximumRule(fieldName: string, definition: Definition): string {
  return abstractValidationRule(fieldName, definition, 'maximum', 'max');
}
