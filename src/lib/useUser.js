import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { loginInProgressVar } from "./auth";

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
  const loginInProgress = useReactiveVar(loginInProgressVar);

  return { loggingIn: loading || loginInProgress, user: data?.currentUser };
};
