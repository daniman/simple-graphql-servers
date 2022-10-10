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

  """
  Sunrise data from https://sunrise-sunset.org/api
  All times shown in UTC
  """
  type Location @key(fields: "streetAddress") {
    streetAddress: String!
    latitude: Float @federation__external
    longitude: Float @federation__external
    sunrise: String @federation__requires(fields: "latitude longitude")
    sunset: String @federation__requires(fields: "latitude longitude")
    solarNoon: String @federation__requires(fields: "latitude longitude")
    dayLength: String @federation__requires(fields: "latitude longitude")
    civilTwilightBegin: String
      @federation__requires(fields: "latitude longitude")
    civilTwilightEnd: String @federation__requires(fields: "latitude longitude")
    nauticalTwilightBegin: String
      @federation__requires(fields: "latitude longitude")
    nauticalTwilightEnd: String
      @federation__requires(fields: "latitude longitude")
    astronomicalTwilightBegin: String
      @federation__requires(fields: "latitude longitude")
    astronomicalTwilightEnd: String
      @federation__requires(fields: "latitude longitude")
  }
`;

const resolvers = {
  Location: {
    __resolveReference: async ({ latitude, longitude }, context) => {
      await utils.awaitTimeout(context.artificialDelay);
      return await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}`
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return {
              latitude,
              longitude,
              ...utils.snakeToCamel(response.results)
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
    graphRef: 'Congress-8vqphc@daylight-times'
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
