import { gql, useQuery } from "@apollo/client";

export const USER_QUERY = gql`
  query UserQuery {
    currentUser {
      id
      firstName
      name
      username
      email
      photo
      hasPurchased
      favoriteReviews {
        id
      }
    }
  }
`;

export const useUser = () => {
  const { data, loading } = useQuery(USER_QUERY);

  return { loggingIn: loading, user: data?.currentUser };
};
