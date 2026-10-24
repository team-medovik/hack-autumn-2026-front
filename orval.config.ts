import { defineConfig } from 'orval';

// Единственный контракт фронта и бэка — openapi/openapi.yaml. Из него генерируются
// типы DTO и функции запросов; сущности (src/entities) строят поверх них свои запросы.
export default defineConfig({
  api: {
    input: { target: './openapi/openapi.yaml' },
    output: {
      mode: 'split',
      target: 'src/shared/api/generated/endpoints.ts',
      schemas: 'src/shared/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      formatter: 'prettier',
      override: {
        mutator: { path: './src/shared/api/axios.ts', name: 'customInstance' },
      },
    },
  },
});
