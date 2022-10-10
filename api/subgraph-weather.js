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
  Weather data from https://openweathermap.org/current
  """
  type Location @key(fields: "streetAddress") {
    streetAddress: String!
    latitude: Float @federation__external
    longitude: Float @federation__external
    weather: String @federation__requires(fields: "latitude longitude")
    temperature: Float @federation__requires(fields: "latitude longitude")
    feelsLike: Float @federation__requires(fields: "latitude longitude")
    tempMin: Float @federation__requires(fields: "latitude longitude")
    tempMax: Float @federation__requires(fields: "latitude longitude")
    pressure: Float @federation__requires(fields: "latitude longitude")
    humidity: Float @federation__requires(fields: "latitude longitude")
    windSpeed: Float @federation__requires(fields: "latitude longitude")
  }
`;

const resolvers = {
  Location: {
    __resolveReference: async ({ latitude, longitude }, context) => {
      await utils.awaitTimeout(context.artificialDelay);
      return await fetch(
        // `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}`
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=f07ae920c19fb5d89d65c0ca5d235b1f`
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return {
              latitude,
              longitude,
              weather: response.weather[0]
                ? response.weather[0].description
                : undefined,
              temperature: response.main.temp,
              feelsLike: response.main.feels_like,
              tempMin: response.main.temp_min,
              tempMax: response.main.temp_max,
              pressure: response.main.pressure,
              humidity: response.main.humidity,
              windSpeed: response.wind.speed
            };
            // return utils.snakeToCamel(response.results);
          } else {
            throw new Error('Error fetching data');
          }
        })
        .catch((err) => new Error(err));
    }
  }
};

const server = new ApolloServer({
  introspection: true,
  apollo: {
    graphRef: 'Congress-8vqphc@weather'
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
      port: process.env.PORT || 4003
    })
    .then(({ url }) => {
      console.log(`🚀  Server is running on ${url}`);
    });
}
