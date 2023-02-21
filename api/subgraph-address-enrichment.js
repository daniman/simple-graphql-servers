const { gql } =
  process.env.NODE_ENV === 'production'
    ? require('apollo-server-lambda')
    : require('apollo-server');
const {
  delayFetch,
  snakeToCamel,
  buildApolloServer
} = require('../utils/utils');

const DELAY_MULTIPLIER = 0;

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Query {
    address(streetAddress: String!): Location
  }

  type Location @key(fields: "latitude longitude") {
    latitude: Float
    longitude: Float
    neighbourhood: String
    county: String
    continent: String
    country: String @shareable
    region: String @shareable
  }
`;

const resolvers = {
  Query: {
    address: async (_, { streetAddress }, { delay }) => {
      return await delayFetch(
        `http://api.positionstack.com/v1/forward?access_key=${
          process.env.POSITION_STACK_KEY
        }&query=${encodeURI(streetAddress)}`,
        { delay: delay * DELAY_MULTIPLIER }
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return snakeToCamel(response.data[0]);
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  },
  Location: {
    __resolveReference: async ({ latitude, longitude }, { delay }) => {
      return await delayFetch(
        `http://api.positionstack.com/v1/reverse?access_key=${process.env.POSITION_STACK_KEY}&query=${latitude},${longitude}`,
        { delay: delay * DELAY_MULTIPLIER }
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return snakeToCamel(response.data[0]);
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  }
};

const server = buildApolloServer('address-enrichment', typeDefs, resolvers);

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
      port: process.env.PORT || 4001
    })
    .then(({ url }) => {
      console.log(`🚀  Server is running on ${url}`);
    });
}
