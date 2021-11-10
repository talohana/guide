import { gql, useQuery } from "@apollo/client";
import Favorite from "@material-ui/icons/Favorite";
import get from "lodash/get";
import React from "react";
import { useUser } from "../lib/useUser";
import { Review } from "./Review";

const REVIEWS_QUERY = gql`
  query ReviewsQuery($limit: Int!) {
    reviews(limit: $limit) {
      id
      text
      stars
      createdAt
      favorited
      author {
        id
        name
        photo
        username
      }
    }
  }
`;

export const Reviews = () => {
  const { data: { reviews } = {}, loading } = useQuery(REVIEWS_QUERY, {
    variables: { limit: 20 },
  });
  const { user } = useUser();
  const favoriteCount = get(user, "favoriteReviews.length");

  return (
    <main className="Reviews mui-fixed">
      <div className="Reviews-header-wrapper">
        <header className="Reviews-header">
          <div className="Reviews-favorite-count">
            <Favorite />
            {favoriteCount}
          </div>
          <h1>Reviews</h1>
        </header>
      </div>
      <div className="Reviews-content">
        {loading ? (
          <div className="Spinner" />
        ) : (
          reviews.map((review) => <Review key={review.id} review={review} />)
        )}
      </div>
    </main>
  );
};
