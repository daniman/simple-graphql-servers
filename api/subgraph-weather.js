const { ApolloServer, gql } =
  process.env.NODE_ENV === 'production'
    ? require('apollo-server-lambda')
    : require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');
const { ApolloServerPluginUsageReporting } = require('apollo-server-core');
const { ApolloServerPluginInlineTrace } = require('apollo-server-core');
const { kelvinToFahrenheit, delayFetch } = require('../utils/utils');

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  """
  Weather data from https://openweathermap.org/current
  """
  type Location @key(fields: "latitude longitude") {
    latitude: Float
    longitude: Float
    weather: String
    temperature: Float
    feelsLike: Float
    tempMin: Float
    tempMax: Float
    pressure: Float
    humidity: Float
    windSpeed: Float
  }
`;

const resolvers = {
  Location: {
    __resolveReference: async ({ latitude, longitude }, { delay }) => {
      return await delayFetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=f07ae920c19fb5d89d65c0ca5d235b1f`,
        { delay: delay * 1 }
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
              temperature: kelvinToFahrenheit(response.main.temp),
              feelsLike: kelvinToFahrenheit(response.main.feels_like),
              tempMin: kelvinToFahrenheit(response.main.temp_min),
              tempMax: kelvinToFahrenheit(response.main.temp_max),
              pressure: response.main.pressure,
              humidity: response.main.humidity,
              windSpeed: response.wind.speed
            };
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
    graphRef: 'simple-servers2@weather'
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
      port: process.env.PORT || 4003
    })
    .then(({ url }) => {
      console.log(`🚀  Server is running on ${url}`);
    });
}
