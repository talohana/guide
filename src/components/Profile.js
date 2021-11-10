import React from "react";
import { login, logout } from "../lib/auth";
import { useUser } from "../lib/useUser";

export const Profile = () => {
  const { user, loggingIn } = useUser();

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
              rel="noopener noreferer"
            >
              <code>{user.username}</code>
            </a>
          </dd>
        </dl>

        <button className="Profile-logout" onClick={logout}>
          Sign Out
        </button>
      </div>
    </main>
  );
};
