import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const ProgressiveLoad = ({ value }: { value?: string | number }) =>
  value ? (
    <b>{value}</b>
  ) : (
    <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>loading...</span>
  );

const kelvinToFahrenheit = (kelvin?: number) =>
  kelvin ? `${(1.8 * (kelvin - 273) + 32).toFixed(0)}°` : undefined;

export const App = () => {
  const [ipAddress, setIpAddress] = useState<string>();

  useEffect(() => {
    fetch('https://ident.me')
      .then((res) => res.text())
      .then((result) => {
        setIpAddress(result);
      });
  }, []);

  const { data } = useQuery(
    gql`
      query ($ipAddress: String!) {
        ipLocation(ip: $ipAddress) {
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
        }
      }
    `,
    {
      skip: !ipAddress,
      variables: { ipAddress }
    }
  );

  return (
    <div
      style={{
        margin: '80px auto',
        fontFamily: 'sans-serif',
        maxWidth: 800
      }}
    >
      <h3>Simple GraphQL servers that run as lambdas</h3>
      <p>
        These are very small GraphQL servers that fetch data from a variety of
        free APIs. They are each enabled with Apollo Federation and are designed
        to be combined and build off each other (
        <a href="https://github.com/daniman/simple-graphql-servers/tree/main/api">
          code on GitHub
        </a>
        ):
      </p>
      <ul>
        {[
          {
            subgraph: 'congress',
            href: 'https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-congress',
            description: (
              <>
                (<b>base graph</b>)
              </>
            )
          },
          {
            subgraph: 'ip-enrichment',
            href: 'https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-ip-enrichment',
            description: (
              <>
                (<b>base graph</b>)
              </>
            )
          },
          {
            subgraph: 'address-enrichment',
            href: 'https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-address-enrichment',
            description: (
              <>
                (federate with <b>congress</b> to get lat/long)
              </>
            )
          },
          {
            subgraph: 'weather',
            href: 'https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-weather',
            description: (
              <>
                (federate with <b>address-enrichment</b> or
                <b>ip-enrichment</b> to use lat/log to extend)
              </>
            )
          },
          {
            subgraph: 'daylight-times',
            href: 'https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-daylight-times',
            description: (
              <>
                (federate with <b>address-enrichment</b> or
                <b>ip-enrichment</b> to use lat/log to extend)
              </>
            )
          }
        ].map(({ subgraph, href, description }) => (
          <a key={subgraph} href={href}>
            <li>
              {subgraph}
              <span
                style={{
                  fontSize: '0.8rem'
                }}
              >
                {' '}
                {description}
              </span>
            </li>
          </a>
        ))}
      </ul>
      <p style={{ marginTop: 40 }}>
        You can try out a graph that combines all these schemas here:
      </p>
      <ul>
        <li>
          <a href="https://studio.apollographql.com/public/congress2/explorer?explorerURLState=N4IgJg9gxgrgtgUwHYBcQC4QEcYIE4CeABMADpJFFQRIDmeCAzoyeZZYnAEb4AUAZgEs8jFAEEkYADIBDUQDkZidEVIgA0kpkAbGUQASMvHkGM1ASlYV2lCPyFQEbG0W3QZKQTSsv2AOgCibyl3T28AATAEfnwfX3ZdTxQYKOd41xpaQWTU618AXzSXAL8gihCoDy8KSOjYsjz4gHcEDwALfCKbQsabErKiCqqIqJi8OPTGGCQTRidelymkOZQu9h6Coo2iHvyQfKA&variant=main">
            When does the sun set on Capitol Hill today?
          </a>
        </li>
      </ul>
      <p style={{ marginTop: 40 }}>
        Here's an example UI that queries the combined graph and loads info with
        @defer:
      </p>
      <div
        style={{
          outline: '1px solid #ccc',
          borderRadius: 4,
          padding: 20
        }}
      >
        <div>
          💻 Your IP address is <ProgressiveLoad value={ipAddress} />.
        </div>
        <div>
          🌐 Your lat/long is{' '}
          <ProgressiveLoad value={data?.ipLocation?.latitude} />/
          <ProgressiveLoad value={data?.ipLocation?.longitude} />.
        </div>
        <div>
          🏠 Neighbourhood:{' '}
          <ProgressiveLoad value={data?.ipLocation?.neighbourhood} />
        </div>
        <div>
          ☁️ The weather today is{' '}
          <ProgressiveLoad value={data?.ipLocation?.weather} /> in{' '}
          <ProgressiveLoad value={data?.ipLocation?.county} />.
        </div>
        <div>
          🌡️ The temperature is{' '}
          <ProgressiveLoad
            value={kelvinToFahrenheit(data?.ipLocation?.temperature)}
          />{' '}
          (feels like{' '}
          <ProgressiveLoad
            value={kelvinToFahrenheit(data?.ipLocation?.feelsLike)}
          />
          ) with a high of{' '}
          <ProgressiveLoad
            value={kelvinToFahrenheit(data?.ipLocation?.tempMax)}
          />{' '}
          and a low of{' '}
          <ProgressiveLoad
            value={kelvinToFahrenheit(data?.ipLocation?.tempMin)}
          />
          .
        </div>
        <div>
          🌅 Sunrise is at{' '}
          <ProgressiveLoad
            value={
              data?.ipLocation?.sunrise
                ? new Date(data?.ipLocation?.sunrise).toLocaleTimeString(
                    'en-US'
                  )
                : undefined
            }
          />
          .
        </div>
        <div>
          🌇 Sunset is at{' '}
          <ProgressiveLoad
            value={
              data?.ipLocation?.sunset
                ? new Date(data?.ipLocation?.sunset).toLocaleTimeString('en-US')
                : undefined
            }
          />
          .
        </div>
      </div>
    </div>
  );
};
