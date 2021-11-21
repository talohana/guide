import { CachePersistor } from "apollo3-cache-persist";
import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import { apollo, cache } from "../lib/apollo";
import logo from "../logo.svg";
import { CurrentTemperature } from "./CurrentTemperature";
import { CurrentUser } from "./CurrentUser";
import { Profile } from "./Profile";
import { Reviews } from "./Reviews";
import { Section } from "./Section";
import { StarCount } from "./StarCount";
import { TableOfContents } from "./TableOfContents";

const Book = () => (
  <div>
    <TableOfContents />
    <Section />
  </div>
);

const persistor = new CachePersistor({
  cache,
  storage: window.localStorage,
  maxSize: 4500000, // little less than 5 MB
  debug: true,
});

apollo.onResetStore(() => persistor.purge());

export default () => {
  const cacheHasBeenSaved = !!localStorage.getItem("apollo-cache-persist");
  const [loadingFromCache, setLoadingFromCache] = useState(cacheHasBeenSaved);

  useEffect(() => {
    async function persist() {
      await persistor.restore();

      setLoadingFromCache(false);
    }

    persist();
  }, []);

  if (loadingFromCache) {
    return null;
  }

  return (
    <div className="App">
      <header className="App-header">
        <StarCount />
        <Link className="App-home-link" to="/">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">The GraphQL Guide</h1>
        </Link>
        <CurrentUser />
        <CurrentTemperature />
      </header>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/Preface" />} />
        <Route exact path="/reviews" component={Reviews} />
        <Route exact path="/me" component={Profile} />
        <Route component={Book} />
      </Switch>
    </div>
  );
};
