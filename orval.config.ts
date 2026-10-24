import { defineConfig } from 'orval';

export default defineConfig({
  auth: {
    input: { target: './openapi/auth-openapi.yaml' },
    output: {
      mode: 'split',
      target: 'src/shared/api/auth/endpoints.ts',
      schemas: 'src/shared/api/auth/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: { path: './src/shared/api/axios.ts', name: 'customInstance' },
      },
      mock: true,
    },
  },
  authZod: {
    input: { target: './openapi/auth-openapi.yaml' },
    output: {
      mode: 'split',
      client: 'zod',
      target: 'src/shared/api/auth/endpoints.ts',
      fileExtension: '.zod.ts',
      clean: false,
    },
  },
});