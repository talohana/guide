import { NetworkStatus, useQuery } from "@apollo/client";
import { throttle } from "lodash";
import React, { useCallback, useEffect } from "react";
import { REVIEWS_QUERY } from "../graphql/Review";
import { Review } from "./Review";

export const ReviewList = () => {
  const { data, fetchMore, networkStatus } = useQuery(REVIEWS_QUERY, {
    variables: { skip: 0, limit: 3 },
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
          fetchMore({ variables: { skip: reviews.length } });
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
