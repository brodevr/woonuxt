import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * GraphQL Code Generator config.
 *
 * Generates TypeScript types from the live WPGraphQL schema via introspection,
 * so the data layer can type GraphQL responses from the real schema instead of
 * hand-maintained interfaces (see docs/architecture.md §4).
 *
 * Requires a REACHABLE GraphQL endpoint (staging/production WordPress). Run:
 *
 *   NUXT_PUBLIC_GRAPHQL_URL=https://your-wp.example.com/graphql npm run graphql:codegen
 *
 * Output goes to types/generated/ (gitignored) and is the source of truth for
 * schema types; domain models (data/mock.ts) are mapped from these in services.
 * Migration is incremental — hand-written types are replaced module by module.
 */
const endpoint = process.env.NUXT_PUBLIC_GRAPHQL_URL || 'http://localhost/graphql'

const config: CodegenConfig = {
  schema: endpoint,
  ignoreNoDocuments: true,
  generates: {
    './types/generated/schema.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: true,
        skipTypename: true,
      },
    },
  },
}

export default config
