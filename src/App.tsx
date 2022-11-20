import React, { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';

export const App = () => {
  const [ipAddress, setIpAddress] = useState<string>();

  useEffect(() => {
    fetch('https://ident.me')
      .then((res) => res.text())
      .then((result) => {
        setIpAddress(result);
      });
  }, []);

  const { data, loading, error } = useQuery(
    gql`
      query ($ipAddress: String!) {
        ipLocation(ip: $ipAddress) {
          latitude
          longitude
          ... on Location @defer {
            weather
            temperature
            tempMax
            tempMin
          }
          ... on Location @defer {
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

  console.log(ipAddress);
  console.log(data);

  return (
    <div
      style={{
        margin: 40,
        fontFamily: 'sans-serif'
      }}
    >
      <h4>
        Simple GraphQL servers that run as Netlify functions and be federated
        with Apollo Federation:
      </h4>
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
                {description}
              </span>
            </li>
          </a>
        ))}
      </ul>
      <p>
        These are small, light weight GraphQL servers that fetch data from a
        variety of free APIs and play off of each other.
      </p>
      <h4 style={{ marginTop: 40 }}>
        Example when these servers are combined together:
      </h4>
    </div>
  );
};
