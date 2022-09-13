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

  type Address @key(fields: "id") {
    id: String!
    latitude: Float @federation__external
    longitude: Float @federation__external
    daylight: Daylight @federation__requires(fields: "latitude longitude")
  }

  # Data from https://sunrise-sunset.org/api
  # All times shown in UTC
  type Daylight {
    sunrise: String
    sunset: String
    solarNoon: String
    dayLength: String
    civilTwilightBegin: String
    civilTwilightEnd: String
    nauticalTwilightBegin: String
    nauticalTwilightEnd: String
    astronomicalTwilightBegin: String
    astronomicalTwilightEnd: String
  }
`;

const resolvers = {
  Address: {
    __resolveReference: async ({ latitude, longitude }) => {
      return await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}`
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return {
              daylight: utils.snakeToCamel(response.results)
            };
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
      graphRef: 'simple-subgraphs@daylight-times'
    },
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ApolloServerPluginInlineTrace(),
      ApolloServerPluginUsageReporting({
        endpointUrl: 'https://usage-reporting.api.staging.c0.gql.zone'
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
