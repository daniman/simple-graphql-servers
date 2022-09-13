const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');
const { ApolloServerPluginUsageReporting } = require('apollo-server-core');
const { ApolloServerPluginInlineTrace } = require('apollo-server-core');

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
    name: 'Nanci Pelosi',
    address: {
      id: '455 Dirksen Senate Office Building'
    }
  }
];

const resolvers = {
  Query: {
    teammates: () => teammates
  }
};

const getHandler = (event, context) => {
  const server = new ApolloServer({
    apollo: {
      graphRef: 'simple-servers@teammates'
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
