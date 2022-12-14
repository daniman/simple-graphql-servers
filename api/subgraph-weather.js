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
    __resolveReference: async ({ latitude, longitude }) => {
      return await fetch(
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
    graphRef: 'simple-servers2@weather'
  },
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ApolloServerPluginInlineTrace(),
    ...(process.env.NODE_ENV === 'production'
      ? [ApolloServerPluginUsageReporting()]
      : [])
  ]
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
      console.log(`????  Server is running on ${url}`);
    });
}
