// const { ApolloServer, gql } = require('apollo-server');
// const { ApolloServerPluginSchemaReporting } = require('apollo-server-core');
// const { ApolloServerPluginUsageReporting } = require('apollo-server-core');
// const { ApolloServerPluginInlineTrace } = require('apollo-server-core');

// const typeDefs = gql`
//   extend schema
//     @link(
//       url: "https://specs.apollo.dev/federation/v2.0"
//       import: ["@key", "@shareable"]
//     )

//   type Query {
//     teammates: [User]
//   }

//   type User {
//     id: String!
//     name: String
//     address: Address
//   }

//   type Address @key(fields: "id") {
//     id: String!
//   }
// `;

// const teammates = [
//   {
//     id: '1',
//     name: 'Apollo Graph, Inc.',
//     address: {
//       id: '140 10th Street, San Francisco, CA 94114'
//     }
//   }
// ];

// const resolvers = {
//   Query: {
//     teammates: () => teammates
//   }
// };

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   plugins: [
//     ApolloServerPluginInlineTrace(),
//     ApolloServerPluginSchemaReporting({
//       endpointUrl:
//         'https://schema-reporting.api.staging.c0.gql.zone/api/graphql'
//     }),
//     ApolloServerPluginUsageReporting({
//       endpointUrl: 'https://usage-reporting.api.staging.c0.gql.zone'
//     })
//   ]
// });

// // The `listen` method launches a web server.
// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });
