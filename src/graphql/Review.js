import { gql } from "@apollo/client";

export const REVIEW_ENTRY = gql`
  fragment ReviewEntry on Review {
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
`;

export const REVIEWS_QUERY = gql`
  query ReviewsQuery($after: ObjID, $limit: Int!, $orderBy: ReviewOrderBy) {
    reviews(after: $after, limit: $limit, orderBy: $orderBy) {
      ...ReviewEntry
    }
  }
  ${REVIEW_ENTRY}
`;
