import { gql, useQuery } from "@apollo/client";
import classNames from "classnames";
import React, { useEffect } from "react";
import Odometer from "react-odometerjs";

const STARS_QUERY = gql`
  query StarsQuery {
    githubStars
  }
`;

const STARS_SUBSCRIPTION = gql`
  subscription StarsSubscription {
    githubStars
  }
`;

export const StarCount = () => {
  const { data, loading, subscribeToMore } = useQuery(STARS_QUERY);

  useEffect(
    () =>
      subscribeToMore({
        document: STARS_SUBSCRIPTION,
        updateQuery: (
          _,
          {
            subscriptionData: {
              data: { githubStars },
            },
          }
        ) => ({ githubStars }),
      }),
    [subscribeToMore]
  );

  return (
    <a
      className={classNames("StarCount", { loading })}
      href="https://github.com/GraphQLGuide/guide"
      target="_blank"
      rel="noopener noreferrer"
    >
      {data && <Odometer value={data.githubStars} />}
    </a>
  );
};
