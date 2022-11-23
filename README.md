## Context

A collection of light-weight GraphQL servers that wrap free REST APIs and run as lambdas. The servers are designed to also be subgraphs that can be combined with Apollo Federation. The data they each provide compliments the others.

Index and demo are deployed to https://simple-graphql-servers.netlify.app/

### Server – `api/`

The lambda servers can be all be found in `api/`. To work on them locally, you can run them individually from the terminal with Node like so:

```
node api/subgraph-ip-enrichment.js
```

The scripts are super simple, so you'll need to restart them to pick up changes. Every time you deploy changes to the server schemas, you can update them in bulk in Apollo GraphOS by running `./update-schemas.sh` in your terminal.

### Client – `src/`

The UI is a TypeScript React app that's been bootstrapped with Create React App. It's just one page and is primarily meant to be an index of the lambdas. Since the lambdas compliment each other though, we've created a cloud supergraph with Apollo and have registered each server in the index as a subgraph.

The supergraph is running at https://main--congress2.apollographos.net/graphql and is @defer-enabled, so our UI also demos a query with @defer by loading a card that progressively populates fields of data from each subgraph.

To run the UI locally:

```
npm install
npm start
```

### Deployments

This app is deployed on Netlify and leverages Netlify functions to deploy the lambdas. The code is deployed from `main` automatically. We've set up the following settings for this Netlify site:

| Setting | Configuration |
| :-- | :-- |
| Build command | npm run build |
| Publish directory | build |
| Production branch | main |
| Functions directory | api |

We have set the following environment variables

| Variable | Source |
| :-- | :-- |
| `NODE_ENV` | production |
| `APOLLO_KEY` | Create a supergraph in [GraphOS Studio]([url](https://studio.apollographql.com)) and make a graph key for schema publishing |
| `IP_INFO_KEY` | Make a free account with https://ipinfo.io/ |
| `POSITION_STACK_KEY` | Make a free account with https://api.positionstack.com/ |
| `PROPUBLICA_KEY` | Request a free API key: https://www.propublica.org/datastore/api/propublica-congress-api |
