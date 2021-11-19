import { gql, NetworkStatus, useQuery } from "@apollo/client";
import { throttle } from "lodash";
import React, { useCallback, useEffect } from "react";
import {
  ON_REVIEW_CREATED_SUBSCRIPTION,
  ON_REVIEW_DELETED_SUBSCRIPTION,
  ON_REVIEW_UPDATED_SUBSCRIPTION,
  REVIEWS_QUERY,
} from "../graphql/Review";
import { cache } from "../lib/apollo";
import { Review } from "./Review";

export const ReviewList = ({ orderBy, minSentences, minStars }) => {
  const variables = { limit: 10, orderBy };

  if (minSentences) {
    variables.minSentences = minSentences;
  }

  if (minStars) {
    variables.minStars = minStars;
  }

  const { data, fetchMore, networkStatus, subscribeToMore } = useQuery(
    REVIEWS_QUERY,
    {
      variables,
      notifyOnNetworkStatusChange: true,
      errorPolicy: "all",
      nextFetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    subscribeToMore({
      document: ON_REVIEW_CREATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        cache.modify({
          fields: {
            reviews(existingReviewRefs = [], { storeFieldName }) {
              if (!storeFieldName.includes("createdAt_DESC")) {
                return existingReviewRefs;
              }

              const newReview = subscriptionData.data.reviewCreated;

              const newReviewRef = cache.writeFragment({
                data: newReview,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                    text
                    stars
                    createdAt
                    favorited
                    author {
                      id
                    }
                  }
                `,
              });

              return [newReviewRef, ...existingReviewRefs];
            },
          },
        });
        return prev;
      },
    });

    subscribeToMore({
      document: ON_REVIEW_DELETED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        cache.modify({
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const deletedId = subscriptionData.data.reviewDeleted;
              return existingReviewRefs.filter(
                (reviewRef) => deletedId !== readField("id", reviewRef)
              );
            },
          },
        });
        return prev;
      },
    });

    subscribeToMore({
      document: ON_REVIEW_UPDATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const updatedReview = subscriptionData.data.reviewUpdated;
        cache.writeFragment({
          id: cache.identify(updatedReview),
          data: updatedReview,
          fragment: gql`
            fragment UpdatedReview on Review {
              id
              text
              stars
              createdAt
              favorited
              author {
                id
              }
            }
          `,
        });
        return prev;
      },
    });
  }, [orderBy, subscribeToMore]);

  const reviews = (data && data.reviews) || [];

  const onScroll = useCallback(
    throttle(() => {
      if (networkStatus !== NetworkStatus.fetchMore) {
        const currentScrollHeight = window.scrollY + window.innerHeight;
        const pixelsFromBottom =
          document.documentElement.scrollHeight - currentScrollHeight;
        const closeToBottom = window.scrollY > 0 && pixelsFromBottom < 250;

        if (closeToBottom && reviews.length > 0) {
          const lastId = reviews[reviews.length - 1].id;

          fetchMore({ variables: { after: lastId } });
        }
      }
    }, 100),
    [fetchMore, networkStatus, reviews.length]
  );

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <div className="Reviews-content">
      {reviews.map((review) => (
        <Review key={review.id} review={review} />
      ))}
      <div className="Spinner" />
    </div>
  );
};
