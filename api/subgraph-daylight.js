const { gql } = require('apollo-server');
const {
  delayFetch,
  snakeToCamel,
  buildApolloServer
} = require('../utils/utils');

const DELAY_MULTIPLIER = 1;

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
  type Location @key(fields: "latitude longitude") {
    latitude: Float
    longitude: Float
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
    __resolveReference: async ({ latitude, longitude }, { delay }) => {
      return await delayFetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`,
        { delay: delay * DELAY_MULTIPLIER }
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return {
              latitude,
              longitude,
              ...snakeToCamel(response.results)
            };
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  }
};

const server = buildApolloServer('daylight', typeDefs, resolvers);

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
