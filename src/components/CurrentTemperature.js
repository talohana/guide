/* eslint-disable graphql/template-strings */

import { gql, useQuery } from "@apollo/client";
import { IconButton } from "@material-ui/core";
import { MyLocation } from "@material-ui/icons";
import React, { useState } from "react";

const TEMPERATURE_QUERY = gql`
  query TemperatureQuery($lat: Float!, $lon: Float!) {
    weather(lat: $lat, lon: $lon)
      @rest(
        type: "WeatherReport"
        path: "weather?appid=4fb00091f111862bed77432aead33d04&{args}"
      ) {
      main @type(name: "WeatherMain") {
        temp
      }
    }
  }
`;

const kelvinToCelsius = (kelvin) => Math.round(kelvin - 273.15);
const kelvinToFahrenheit = (kelvin) =>
  Math.round((kelvin - 273.15) * (9 / 5) + 32);

function Content() {
  const [position, setPosition] = useState(null);
  const [gettingPosition, setGettingPosition] = useState(false);
  const [displayInCelsius, setDisplayInCelsius] = useState(true);

  function requestLocation() {
    setGettingPosition(true);
    window.navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setGettingPosition(false);
        setPosition({ lat: latitude, lon: longitude });
      }
    );
  }

  const haveLocation = !!position;

  const { data, loading } = useQuery(TEMPERATURE_QUERY, {
    skip: !haveLocation,
    variables: position,
  });

  if (loading || gettingPosition) {
    return <div className="Spinner" />;
  }

  if (!haveLocation) {
    return (
      <IconButton
        className="Weather-get-location"
        onClick={requestLocation}
        color="inherit"
      >
        <MyLocation />
      </IconButton>
    );
  }

  const kelvin = data.weather.main.temp;
  const formattedTemp = displayInCelsius
    ? `${kelvinToCelsius(kelvin)} °C`
    : `${kelvinToFahrenheit(kelvin)} °F`;

  return (
    <IconButton
      onClick={() =>
        setDisplayInCelsius((prevDisplayInCelsius) => !prevDisplayInCelsius)
      }
    >
      {formattedTemp}
    </IconButton>
  );
}

export const CurrentTemperature = () => {
  return (
    <div className="Weather">
      <Content />
    </div>
  );
};
