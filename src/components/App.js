import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { Link } from "react-router-dom";
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

export default () => (
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
