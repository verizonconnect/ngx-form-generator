/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import { Definition, Property } from './generator-lib';

function hasMetadata(fieldName: string, definition: Definition, metadataName: string): boolean {
  return definition.properties[fieldName].hasOwnProperty(metadataName);
}

function abstractRule(fieldName: string, definition: Definition, ruleName: keyof Property): string {
  return hasMetadata(fieldName, definition, ruleName)
    ? `Validators.${ruleName}(${definition.properties[fieldName][ruleName]})`
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

export function minLengthRule(fieldName: string, definition: Definition): string {
  return abstractRule(fieldName, definition, 'minLength');
}

export function maxLengthRule(fieldName: string, definition: Definition): string {
  return abstractRule(fieldName, definition, 'maxLength');
}

export function emailRule(fieldName: string, definition: Definition): string {
  return definition.properties[fieldName].format === 'email' ? `Validators.email` : '';
}
