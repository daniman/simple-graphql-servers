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
const { delayFetch, snakeToCamel } = require('../utils/utils');

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Query {
    address(streetAddress: String!): Location
  }

  # type MemberSessionDetails @key(fields: "office") {
  #   office: String!
  #   location: Location
  # }

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
    address: async (_, { streetAddress }) => {
      return await fetch(
        `http://api.positionstack.com/v1/forward?access_key=${
          process.env.POSITION_STACK_KEY
        }&query=${encodeURI(streetAddress)}`
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
  MemberSessionDetails: {
    __resolveReference: async ({ office }) => {
      return await fetch(
        `http://api.positionstack.com/v1/forward?access_key=${
          process.env.POSITION_STACK_KEY
        }&query=${encodeURI(office)}`
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return {
              office,
              location: snakeToCamel(response.data[0])
            };
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
        { delay: delay * 0 }
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

const server = new ApolloServer({
  introspection: true,
  apollo: {
    graphRef: 'simple-servers2@address-enrichment'
  },
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ApolloServerPluginInlineTrace(),
    ...(process.env.NODE_ENV === 'production'
      ? [ApolloServerPluginUsageReporting()]
      : [])
  ],
  context: async ({ req }) => ({
    delay: parseInt(req.headers.delay) || 0
  })
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
      port: process.env.PORT || 4001
    })
    .then(({ url }) => {
      console.log(`🚀  Server is running on ${url}`);
    });
}
