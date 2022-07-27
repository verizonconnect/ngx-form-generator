#! /usr/bin/env node

/**
 * @license
 * Licensed under the MIT License, (“the License”); you may not use this
 * file except in compliance with the License.
 *
 * Copyright (c) 2020 Verizon
 */

import { makeForm, loadSpec, makeFileName, saveFile, getDefinitionKeys, makePrettyDefinitionWithHeader } from './generator-lib';
import { join } from 'path';
import { OpenAPI } from 'openapi-types';
import { Definition } from './rules';
import { Args } from './args';
const yargs = require('yargs');

async function main(): Promise<void> {
  const argv = yargs
    .option('input-spec', {
      alias: ['i', 'swaggerUrl'],
      description: 'Location of the OpenAPI spec as a URL or file path',
      type: 'string',
      require: true
    })
    .option('output', {
      alias: ['o', 'outDir'],
      description: 'Where to write the generated files',
      type: 'string'
    })
    .option('file-name', {
      alias: ['f', 'outFile'],
      description: 'Generated file name',
      type: 'string'
    })
    .option('multiplefiles', {
      alias: ['m', 'multi'],
      description: 'Generated file per definition',
      type: 'string'
    })
    .help()
    .wrap(null)
    .usage('Generates Angular ReactiveForms from an OpenAPI v2 or v3 spec.\n\n Usage: $0 -i <spec> -o <path>')
    .example('ngx-form-generator -i https://petstore.swagger.io/v2/swagger.json -o petstore-forms')
    .example('ngx-form-generator -i https://petstore.swagger.io/v2/swagger.yaml -o petstore-forms')
    .example('npx ngx-form-generator -i swagger.json -o project/form/src/lib')
    .alias('help', 'h').argv;

  const args = new Args(
    argv['input-spec'],
    argv['output'], 
    argv['file-name'], 
    argv['multiplefiles']
  );
  //const inputfile=args.inputspec;
  const inputfile=argv['input-spec'];
  console.log('start load spec(' + inputfile + ') ...');
  const spec = await loadSpec(inputfile);
  console.log('load spec completed');
  

  console.log('start make form(s) ...');

  let success = false;
  if (args.multiplefiles){
    success = makeFormMulti(spec, args);
  }
  else {
    const file = makeForm(spec);

    let fileName = argv['file-name'] || makeFileName(spec) || 'forms.ts';

    if (argv.output) {
      fileName = join(argv.output, fileName);
    }

    await saveFile(file, fileName);
    success = true;
  }

  console.log((success)?'Completed.':'Finished with errors.');
}

function makeFormMulti(spec: OpenAPI.Document, args: Args): boolean {
  
  console.log('start define keys');
  const definitions = getDefinitionKeys(spec);
  const definitionKeys = Object.keys(definitions);
  console.log('define keys completed');

  if (!args.multiplefiles){
    throw new Error('multiple file save only');
  }

  definitionKeys
    .forEach(async (key) => {
      const prettyFile = makePrettyDefinitionWithHeader(key, (definitions as Record<string, Definition>)[key]);
      
      let fileName:string = args.filename || makeFileName(spec) || 'forms.ts';
      fileName = key + fileName;
      if (args.output) {          
        fileName = join(args.output, fileName);
      }
      
      console.log('saving file: ' + fileName);
      
      await saveFile(prettyFile, fileName);
    })
    ;

  return true;
}
main();
