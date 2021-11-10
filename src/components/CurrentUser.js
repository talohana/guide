import React from "react";
import { Link } from "react-router-dom";
import { login } from "../lib/auth";
import { useUser } from "../lib/useUser";

export const CurrentUser = () => {
  const { user, loggingIn } = useUser();

  let content = null;

  if (loggingIn) {
    content = <div className="Spinner" />;
  } else if (!user) {
    content = <button onClick={login}>Sign In</button>;
  } else {
    content = (
      <Link to="/me" className="User">
        <img src={user.photo} alt={user.firstName} />
        {user.firstName}
      </Link>
    );
  }

  return <div className="CurrentUser">{content}</div>;
};
