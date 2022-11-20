import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <div
      style={{
        margin: 40,
        fontFamily: 'sans-serif'
      }}
    >
      <h3>Simple GraphQL servers that are Apollo Federation enabled:</h3>
      <ul>
        <a href="https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-congress">
          <li>
            congress
            <span
              style={{
                fontSize: '0.8rem'
              }}
            >
              (<b>base graph</b>)
            </span>
          </li>
        </a>
        <a href="https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-ip-enrichment">
          <li>
            ip-enrichment
            <span
              style={{
                fontSize: '0.8rem'
              }}
            >
              (<b>base graph</b>)
            </span>
          </li>
        </a>
        <a href="https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-address-enrichment">
          <li>
            address-enrichment
            <span
              style={{
                fontSize: '0.8rem'
              }}
            >
              (federate with <b>congress</b> to get lat/long)
            </span>
          </li>
        </a>
        <a href="https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-weather">
          <li>
            weather
            <span
              style={{
                fontSize: '0.8rem'
              }}
            >
              (federate with <b>address-enrichment</b> or
              <b>ip-enrichment</b> to use lat/log to extend)
            </span>
          </li>
        </a>
        <a href="https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-daylight-times">
          <li>
            daylight-times
            <span
              style={{
                fontSize: '0.8rem'
              }}
            >
              (federate with <b>address-enrichment</b> or
              <b>ip-enrichment</b> to use lat/log to extend)
            </span>
          </li>
        </a>
      </ul>
    </div>
  </React.StrictMode>
);
