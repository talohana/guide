import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { find } from "lodash";
import { countSentences } from "./helpers";
import { link } from "./link";

const typeDefs = gql`
  extend type Section {
    scrollY: Int
  }
`;

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        reviews: {
          keyArgs: false,
          merge(existing = [], incoming, { readField }) {
            const notAlreadyInCache = (review) =>
              !find(
                existing,
                (existingReview) =>
                  readField("id", existingReview) === readField("id", review)
              );

            const newReviews = incoming.filter(notAlreadyInCache);

            return [...existing, ...newReviews];
          },
          read(
            reviewRefs,
            { args: { orderBy, minStars, minSentences }, readField }
          ) {
            if (!reviewRefs) {
              return reviewRefs;
            }

            const filtered = reviewRefs.filter((reviewRef) => {
              const stars = readField("stars", reviewRef);
              const text = readField("text", reviewRef);

              return stars >= minStars && countSentences(text) > minSentences;
            });

            filtered.sort((a, b) => {
              const createdAtA = readField("createdAt", a);
              const createdAtB = readField("createdAt", b);

              if (orderBy === "createdAt_DESC") {
                return createdAtB - createdAtA;
              } else {
                return createdAtA - createdAtB;
              }
            });

            return filtered;
          },
        },
      },
    },
    Section: {
      fields: {
        scrollY: (scrollY) => scrollY || 0,
      },
    },
  },
});

export const apollo = new ApolloClient({ link, cache, typeDefs });
