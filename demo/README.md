# Demo

Be sure to build the ngx-form-generator tool first by running `npm run build` in the root directory.

Run the following from the `/demo` directory:

open https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml
copy it's contents into swagger.yaml

open https://petstore3.swagger.io/api/v3/openapi.json
copy it's contents into swagger.json

```bash
npm install
npm run generate:forms
ng build forms
ng serve
```
