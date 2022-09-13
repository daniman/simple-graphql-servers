const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const fetch = require('node-fetch');
const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');
const { ApolloServerPluginUsageReporting } = require('apollo-server-core');
const { ApolloServerPluginInlineTrace } = require('apollo-server-core');
const utils = require('../utils');

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Location @key(fields: "streetAddress") {
    # full and valid street address
    streetAddress: String!
    latitude: Float
    longitude: Float
    neighbourhood: String
    region: String
    county: String
    country: String
    continent: String
  }
`;

const resolvers = {
  Location: {
    __resolveReference: async ({ streetAddress }) => {
      return await fetch(
        `https://positionstack.com/geo_api.php?query=${encodeURI(
          streetAddress
        )}`
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return utils.snakeToCamel(response.data[0]);
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  }
};

const getHandler = (event, context) => {
  const server = new ApolloServer({
    apollo: {
      graphRef: 'simple-servers@address-enrichment'
    },
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ApolloServerPluginInlineTrace(),
      ApolloServerPluginUsageReporting({
        // endpointUrl: 'https://usage-reporting.api.staging.c0.gql.zone'
      })
    ]
  });

  const graphqlHandler = server.createHandler();
  if (!event.requestContext) {
    event.requestContext = context;
  }
  return graphqlHandler(event, context);
};

exports.handler = getHandler;
