import { NetworkStatus, useQuery } from "@apollo/client";
import { throttle } from "lodash";
import React, { useCallback, useEffect } from "react";
import { REVIEWS_QUERY } from "../graphql/Review";
import { Review } from "./Review";

export const ReviewList = ({ orderBy }) => {
  const { data, fetchMore, networkStatus } = useQuery(REVIEWS_QUERY, {
    variables: { limit: 10, orderBy },
    notifyOnNetworkStatusChange: true,
    errorPolicy: "all",
  });

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
