/**
 * Typed error classes for the data layer.
 *
 * Services and HTTP clients throw/normalize to these so the UI can react to
 * error categories instead of parsing raw strings.
 */

/** Base class for all application-level errors. */
export class AppError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = 'AppError'
    if (options?.cause !== undefined) {
      // Preserve the original error for logging/observability.
      ;(this as { cause?: unknown }).cause = options.cause
    }
  }
}

/** Raised when a GraphQL request fails at the transport level. */
export class GraphQLRequestError extends AppError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'GraphQLRequestError'
  }
}

/** Raised when a GraphQL response contains an `errors` array. */
export class GraphQLResponseError extends AppError {
  constructor(
    message: string,
    public readonly errors: unknown[],
    options?: { cause?: unknown },
  ) {
    super(message, options)
    this.name = 'GraphQLResponseError'
  }
}
