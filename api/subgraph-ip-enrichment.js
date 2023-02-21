const { gql } = require('apollo-server');
const {
  snakeToCamel,
  delayFetch,
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
    ipLocation(ip: String!): Location
  }

  type Location @key(fields: "latitude longitude") {
    latitude: Float
    longitude: Float
    postal: String
    timezone: String
  }
`;

const resolvers = {
  Query: {
    ipLocation: async (_, { ip }, { delay }) => {
      return await delayFetch(
        `https://ipinfo.io/${encodeURI(ip)}?token=${process.env.IP_INFO_KEY}`,
        { delay: delay * DELAY_MULTIPLIER }
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            const [latitude, longitude] = response.loc.split(',');
            return snakeToCamel({
              latitude,
              longitude,
              ...response
            });
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  }
};

const server = buildApolloServer('ip-enrichment', typeDefs, resolvers);

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
      port: process.env.PORT || 4004
    })
    .then(({ url }) => {
      console.log(`🚀  Server is running on ${url}`);
    });
}
