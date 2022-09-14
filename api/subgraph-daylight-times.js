const { ApolloServer, gql } =
  process.env.NODE_ENV === 'production'
    ? require('apollo-server-lambda')
    : require('apollo-server');
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
    streetAddress: String!
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
  Location: {
    __resolveReference: async ({ latitude, longitude }) => {
      await timeout(context.artificialDelay * 2);
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

const server = new ApolloServer({
  introspection: true,
  apollo: {
    graphRef: 'simple-servers@daylight-times'
  },
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ApolloServerPluginInlineTrace(),
    ...(process.env.NODE_ENV === 'production'
      ? [ApolloServerPluginUsageReporting()]
      : [])
  ],
  context: async () => {
    return await fetch(
      'https://simple-graphql-servers.netlify.app/.netlify/functions/get-artificial-delay'
    )
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          return data;
        } else {
          throw new Error('Error fetching artificial delay variable');
        }
      })
      .catch((err) => new Error(err));
  }
});

const getHandler = (event, context) => {
  const graphqlHandler = server.createHandler();
  if (!event.requestContext) {
    event.requestContext = context;
  }
  return graphqlHandler(event, context);
};

exports.handler = getHandler;

if (process.env.NODE_ENV !== 'production') {
  server
    .listen({
      port: process.env.PORT || 4002
    })
    .then(({ url }) => {
      console.log(`🚀  Server is running on ${url}`);
    });
}
