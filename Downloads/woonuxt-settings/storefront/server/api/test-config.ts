export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  return {
    graphqlUrl: config.public.graphqlUrl,
    envUrl: process.env.NUXT_PUBLIC_GRAPHQL_URL
  }
})
