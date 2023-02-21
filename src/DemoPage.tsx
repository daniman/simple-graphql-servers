import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApolloExplorer } from '@apollo/explorer/react';
import { WeatherCard } from './WeatherCard';

export const DemoPage = () => {
  const [ipAddress, setIpAddress] = useState<string>();

  useEffect(() => {
    fetch('https://ident.me')
      .then((res) => res.text())
      .then((res) => {
        setIpAddress(res);
      });
  }, []);

  return (
    <>
      <div>
        <Link to="/">Go home</Link>
      </div>
      <h2 style={{ marginTop: 40 }}>Locality Supergraph</h2>
      <p>
        The{' '}
        <a href="https://studio.apollographql.com/graph/congress2/explorer?explorerURLState=N4IgzghgbgpgJgYQPYBsUwMYBcCWSB2AknCAFwgBGGAjBgJwBM1DAtFQKwAMLALAOwA2ABwshDPjBYCAzNL7sMnYYOkgANOGjxkaTLgIBRfFgBOAT2JkQGaZ2rw%2BrHhXYAzXtT4Y2nPnxb2fBBKAjCcdNScIAC%2BQA&referrer=operation_collections&variant=main">
          locality supergraph
        </a>{' '}
        combines many of the graphs on the home page into a single, queryable
        endpoint. The following data queries this single endpoint and you can
        use the Explorer below to explor it fully.
      </p>
      {ipAddress && <WeatherCard ipAddress={ipAddress} />}

      <ApolloExplorer
        className="apollo-explorer"
        graphRef="congress2@main"
        persistExplorerState={true}
        initialState={{
          document: `# Hit the blue EnrichAddress
          # button to run this query!
          
          query EnrichAddress {
            address(streetAddress: "1 Ferry Building, San Francisco, CA 94105") {
              ... on Location @defer {
                latitude
                longitude
              }
              ... on Location @defer {
                neighbourhood
                county
              }
              ... on Location @defer {
                weather
                temperature
                tempMax
                tempMin
                feelsLike
              }
              ... on Location @defer {
                sunrise
                sunset
              }
              ... on Location @defer {
                moonPhaseImg
              }
            }
          }`,
          variables: {},
          headers: {},
          displayOptions: {
            showHeadersAndEnvVars: false,
            docsPanelState: 'open',
            theme: 'dark'
          }
        }}
      />
    </>
  );
};
