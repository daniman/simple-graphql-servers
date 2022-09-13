const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const fetch = require('node-fetch');
const utils = require('../utils');

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Address @key(fields: "id") {
    id: String!
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
  Address: {
    __resolveReference: async ({ id }) => {
      return await fetch(
        `https://positionstack.com/geo_api.php?query=${encodeURI(id)}`
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
    schema: buildSubgraphSchema({ typeDefs, resolvers })
  });

  const graphqlHandler = server.createHandler();
  if (!event.requestContext) {
    event.requestContext = context;
  }
  return graphqlHandler(event, context);
};

exports.handler = getHandler;
