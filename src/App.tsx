import { useEffect, useState } from 'react';
import { GraphCard, pluralize } from './GraphCard';
import { WeatherCard } from './WeatherCard';

export const App = () => {
  const [ipAddress, setIpAddress] = useState<string>();
  const [publicGraphs, setPublicGraphs] = useState<
    {
      subgraph: string;
      href: string;
      description?: string;
    }[]
  >([]);

  useEffect(() => {
    fetch('https://ident.me')
      .then((res) => res.text())
      .then((res) => {
        setIpAddress(res);
      });

    fetch(
      'https://raw.githubusercontent.com/daniman/simple-graphql-servers/main/public-graphs.json'
    )
      .then((res) => res.json())
      .then((res) => setPublicGraphs(res));
  }, []);

  return (
    <div>
      <h2>Simple GraphQL Servers</h2>
      <p>
        Check out a demo supergraph that combines the graphs below using Apollo
        Federation{' '}
        <a href="https://studio.apollographql.com/graph/congress2/explorer?explorerURLState=N4IgzghgbgpgJgYQPYBsUwMYBcCWSB2AknCAFwgBGGAjBgJwBM1DAtFQKwAMLALAOwA2ABwshDPjBYCAzNL7sMnYYOkgANOGjxkaTLgIBRfFgBOAT2JkQGaZ2rw%2BrHhXYAzXtT4Y2nPnxb2fBBKAjCcdNScIAC%2BQA&referrer=operation_collections&variant=main">
          here
        </a>
        . The data below is queried from that supergraph:
      </p>
      {ipAddress && <WeatherCard ipAddress={ipAddress} />}

      <h2 style={{ marginTop: 120 }}>
        {pluralize(publicGraphs.length, 'simple graph')}:
      </h2>
      <p>
        These are small GraphQL servers that each fetch data from a unique free
        API. They are enabled with Apollo Federation and are designed to be
        compatible with each other (
        <a href="https://github.com/daniman/simple-graphql-servers/tree/main/api">
          code on GitHub
        </a>
        ).
      </p>
      <div className="grid">
        {publicGraphs.map((props) => (
          <GraphCard key={props.href} {...props} />
        ))}
      </div>
    </div>
  );
};
