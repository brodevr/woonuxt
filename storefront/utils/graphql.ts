export const GET_WOONUXT_SETTINGS = `
  query getWooNuxtSettings {
    woonuxtSettings {
      primary_color
      logo
      frontEndUrl
      domain
      maxPrice
      productsPerPage
      currencyCode
      currencySymbol
      global_attributes {
        label
        slug
        showCount
        hideEmpty
        openByDefault
      }
      stripeSettings {
        enabled
        testmode
        active_publishable_key
        account_id
        apple_pay_merchant_identifier
      }
      paypalSettings {
        enabled
        sandbox
        email
      }
      wooNuxtSEO {
        provider
        url
        handle
      }
    }
  }
`

export const GET_PRODUCTS = `
  query getProducts($first: Int, $after: String, $category: [String]) {
    products(first: $first, after: $after, where: { categoryIn: $category }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        type
        description
        shortDescription
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
        productCategories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`

export const GET_PRODUCT_BY_SLUG = `
  query getProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
        stockStatus
      }
      ... on VariableProduct {
        price
        regularPrice
        salePrice
        stockStatus
      }
      productCategories {
        nodes {
          name
          slug
        }
      }
    }
  }
`

export const GET_CATEGORIES = `
  query getCategories {
    productCategories(where: { hideEmpty: true }) {
      nodes {
        id
        name
        slug
        count
        image {
          sourceUrl
        }
      }
    }
  }
`

// Instant-search: server-side product search (WooGraphQL `search` arg).
export const SEARCH_PRODUCTS = `
  query searchProducts($search: String!, $first: Int) {
    products(first: $first, where: { search: $search }) {
      nodes {
        databaseId
        name
        slug
        image {
          sourceUrl
        }
        ... on SimpleProduct { price }
        ... on VariableProduct { price }
      }
    }
  }
`
