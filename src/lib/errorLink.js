import { onError } from "@apollo/client/link/error";

const KNOWN_ERRORS = ["unauthorized"];

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError) {
    console.log(`[Network Error]: ${networkError}`);
    return;
  }

  if (graphQLErrors) {
    const unknownErrors = graphQLErrors.filter(
      (error) => !KNOWN_ERRORS.includes(error.message)
    );

    if (unknownErrors.length) {
      alert(`😳 An unexpected error occurred on the server`);
      unknownErrors.forEach(({ message, path }) => {
        console.log(`[GraphQL Error]: Message: ${message}, Path: ${path}`);
      });
    }
  }
});
