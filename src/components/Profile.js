import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { apolloSpace } from "../lib/apollo";
import { login, logout } from "../lib/auth";
import { useUser } from "../lib/useUser";

const LAUNCH_QUERY = gql`
  query LaunchQuery {
    launchNext {
      details
      launch_date_utc
      launch_site {
        site_name
      }
      mission_name
      rocket {
        rocket_name
      }
    }
  }
`;

const Launch = () => {
  const { data, loading } = useQuery(LAUNCH_QUERY, {
    fetchPolicy: "cache-and-network",
    client: apolloSpace,
    onCompleted: () =>
      window.scrollTo({ top: 1000, left: 0, behavior: "smooth" }),
  });

  const {
    launchNext: {
      details,
      launch_date_utc,
      launch_site,
      mission_name,
      rocket,
    } = {},
  } = data || {};

  if (!details) {
    return <div className="Spinner" />;
  }

  return (
    <div>
      The next SpaceX launch will be:
      <dl>
        <dt>Date</dt>
        <dd>
          <code>{new Date(launch_date_utc).toString()}</code>
        </dd>

        <dt>Mission</dt>
        <dd>
          <code>{mission_name}</code>
        </dd>

        <dt>Rocket</dt>
        <dd>
          <code>{rocket.rocket_name}</code>
        </dd>

        <dt>Site</dt>
        <dd>
          <code>{launch_site.site_name}</code>
        </dd>

        <dt>Details</dt>
        <dd className="-non-code">{details}</dd>
      </dl>
    </div>
  );
};

export const Profile = () => {
  const { user, loggingIn } = useUser();
  const [showLaunch, setShowLaunch] = useState(false);

  if (loggingIn) {
    return (
      <main className="Profile">
        <div className="Spinner" />
      </main>
    );
  } else if (!user) {
    return (
      <main className="Profile">
        <button onClick={login} className="Profile-login">
          Sign in
        </button>
      </main>
    );
  }

  return (
    <main className="Profile">
      <div className="Profile-header-wrapper">
        <header className="Profile-header">
          <h1>{user.name}</h1>
        </header>
      </div>
      <div className="Profile-content">
        <dl>
          <dt>Email</dt>
          <dd>
            <code>{user.email}</code>
          </dd>
          <dt>Membership level</dt>
          <dd>
            <code>{user.hasPurchased || "GUEST"}</code>
          </dd>
          <dt>OAuth Github Account</dt>
          <dd>
            <a
              href="https://github.com/settings/applications"
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>{user.username}</code>
            </a>
          </dd>
        </dl>

        <button className="Profile-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
      <div className="Profile-footer">
        <button
          className="Profile-toggle-launch"
          onClick={() => setShowLaunch((prev) => !prev)}
        >
          <span role="img" aria-label="rocket">
            🚀
          </span>
        </button>

        {showLaunch && <Launch />}
      </div>
    </main>
  );
};
