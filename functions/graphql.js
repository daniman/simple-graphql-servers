/**
 * Utilities:
 * lsof -i :3000
 */

const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildSubgraphSchema } = require('@apollo/subgraph');

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type Query {
    teammates: [User]
  }

  type User {
    id: String!
    name: String
    address: Address
  }

  type Address @key(fields: "id") {
    # ID here is a full street address that we could use to look up metadata
    id: String!
  }
`;

const teammates = [
  {
    id: '1',
    name: 'Apollo Graph, Inc.',
    address: {
      id: '140 10th Street, San Francisco, CA 94114'
    }
  }
];

const resolvers = {
  Query: {
    teammates: () => teammates
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers })
});

exports.handler = server.createHandler();

// The `listen` method launches a web server.
// server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });
