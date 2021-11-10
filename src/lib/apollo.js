import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { getAuthToken } from "auth0-helpers";

const httpLink = new HttpLink({
  uri: "https://api.graphql.guide/graphql",
});

const wsLink = new WebSocketLink({
  uri: "wss://api.graphql.guide/subscriptions",
  options: {
    reconnect: true,
  },
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken({
    doLoginIfTokenExpired: true,
  });

  if (token) {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    };
  } else {
    return { headers };
  }
});

const authedHttpLink = authLink.concat(httpLink);

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  authedHttpLink
);

const cache = new InMemoryCache();

export const apollo = new ApolloClient({ link, cache });
