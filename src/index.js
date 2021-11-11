import { ApolloProvider } from "@apollo/client";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";
import "./index.css";
import { apollo } from "./lib/apollo";

const GRAPHQL_PINK = "#e10098";

const theme = createMuiTheme({
  palette: { primary: { main: GRAPHQL_PINK } },
  typography: { useNextVariants: true },
});

render(
  <BrowserRouter>
    <ApolloProvider client={apollo}>
      <MuiThemeProvider theme={theme}>
        <App />
      </MuiThemeProvider>
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

module.hot.accept();
