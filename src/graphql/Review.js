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
  query ReviewsQuery(
    $after: ObjID
    $limit: Int!
    $orderBy: ReviewOrderBy
    $minStars: Int
    $minSentences: Int
  ) {
    reviews(
      after: $after
      limit: $limit
      orderBy: $orderBy
      minStars: $minStars
      minSentences: $minSentences
    ) {
      ...ReviewEntry
    }
  }
  ${REVIEW_ENTRY}
`;

export const ON_REVIEW_CREATED_SUBSCRIPTION = gql`
  subscription OnReviewCreated {
    reviewCreated {
      ...ReviewEntry
    }
  }
  ${REVIEW_ENTRY}
`;

export const ON_REVIEW_UPDATED_SUBSCRIPTION = gql`
  subscription OnReviewUpdated {
    reviewUpdated {
      ...ReviewEntry
    }
  }
  ${REVIEW_ENTRY}
`;

export const ON_REVIEW_DELETED_SUBSCRIPTION = gql`
  subscription OnReviewDeleted {
    reviewDeleted
  }
`;
