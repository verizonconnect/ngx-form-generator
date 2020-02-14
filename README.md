# Angular Form Generator

Generates an Angular ReactiveForm from a Swagger or OpenAPI definition.

Validation rules should have a single source of truth. These rules should be exposed to consumers to apply them. By doing this we can be sure that the same rules for UI validation are enforced at the API layer.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Install

```bash
# install locally in project
npm install @verizonconnect/ngx-form-generator --save-dev

# install globally
npm install @verizonconnect/ngx-form-generator -g
```

## CLI Usage

```bash
ngx-form-generator -f swagger.json -o projects/forms/src/lib/

# when installed locally in project run with npx
npx ngx-form-generator -f swagger.yaml -o projects/forms/src/lib/
```

| Option       | Alias            | Comment                                          | Required |
| ------------ | ---------------- | ------------------------------------------------ | -------- |
| --version    |                  | Show version number                              |          |
| --input-spec | -i, --swaggerUrl | Location of the OpenAPI spec as URL or file path | ✓        |
| --output     | -o, --outDir     | Where to write the generated files               |          |
| --file-name  | -f, --outFile    | Generated file name                              |          |
| --help       | -h               | Show help                                        |          |

### Example CLI Usage

```bash
ngx-form-generator -i https://petstore.swagger.io/v2/swagger.json -o petstore-forms
ngx-form-generator -i https://petstore.swagger.io/v2/swagger.yaml -o petstore-forms
npx ngx-form-generator -i swagger.json -o project/form/src/lib
```

## Library Usage

```typescript
import { loadSpec, makeForm, saveFile } from '@verizonconnect/ngx-form-generator';

async function main() {
  const spec = await loadSpec('swagger.json');
  const form = makeForm(spec);
  await saveFile(form, 'projects/forms/src/lib/index.ts');
}
await main();
```

## Examples Generated Form

```typescript
import { FormGroup, FormControl, Validators } from '@angular/forms';

export const addressModelForm = new FormGroup({
  firstName: new FormControl(null, [
    Validators.required,
    Validators.pattern(/^[a-zA-Z\'\s]+$/),
    Validators.minLength(1),
    Validators.maxLength(100)
  ]),
  lastName: new FormControl(null, [
    Validators.required,
    Validators.pattern(/^[a-zA-Z\'\s]+$/),
    Validators.minLength(1),
    Validators.maxLength(100)
  ]),
  address: new FormControl(null, [
    Validators.required,
    Validators.pattern(/^[\w\'\s]+$/),
    Validators.minLength(1),
    Validators.maxLength(100)
  ]),
  address2: new FormControl(null, [
    Validators.pattern(/^[\w\'\s]+$/),
    Validators.minLength(1),
    Validators.maxLength(100)
  ]),
  city: new FormControl(null, [
    Validators.required,
    Validators.pattern(/^[\w\'\s]+$/),
    Validators.minLength(1),
    Validators.maxLength(100)
  ]),
  postalCode: new FormControl(null, [
    Validators.required,
    Validators.pattern(/^[\w\s]+$/),
    Validators.minLength(4),
    Validators.maxLength(8)
  ]),
  emailAddress: new FormControl(null, [
    Validators.required,
    Validators.pattern(/^[\w\@\!\#\%\&\'\*\+\-\/\=\?\`\{\|\}\~\.]+$/),
    Validators.email
  ])
});
```

## License

[MIT](https://github.com/verizonconnect/blob/master/LICENSE)
