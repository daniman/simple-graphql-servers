const fetch = require('node-fetch');
const { ApolloServer } =
  process.env.NODE_ENV === 'production'
    ? require('apollo-server-lambda')
    : require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');
const { ApolloServerPluginUsageReporting } = require('apollo-server-core');
const { ApolloServerPluginInlineTrace } = require('apollo-server-core');

const toCamel = (s) => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

const snakeToCamel = (object) => {
  const newObj = {};
  Object.entries(object).forEach(([key, value]) => {
    newObj[toCamel(key)] =
      value instanceof Array
        ? value.map((item) => snakeToCamel(item))
        : !!value && typeof value === 'object'
        ? snakeToCamel(value)
        : value;
  });
  return newObj;
};

const kelvinToFahrenheit = (kelvin) =>
  kelvin ? (1.8 * (kelvin - 273) + 32).toFixed(0) : undefined;

const delayFetch = (url, options) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(fetch(url, options));
    }, options.delay);
  });

const buildApolloServer = (subgraphName, typeDefs, resolvers) => {
  return new ApolloServer({
    introspection: true,
    apollo: {
      graphRef: `simple-servers2@${subgraphName}`
    },
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ApolloServerPluginInlineTrace(),
      ...(process.env.NODE_ENV === 'production'
        ? [ApolloServerPluginUsageReporting()]
        : [])
    ],
    context: async ({ req, event }) => {
      /**
       * we have to do this unfortunately because in the apollo-server package, we key off `req`
       * but in the apollo-server-lambda package we need to key off `event`
       */
      return {
        delay: !!req
          ? parseInt(req.headers.delay) || 0
          : !!event
          ? parseInt(event.headers.delay) || 0
          : 0
      };
    }
  });
};

exports.snakeToCamel = snakeToCamel;
exports.kelvinToFahrenheit = kelvinToFahrenheit;
exports.delayFetch = delayFetch;
exports.buildApolloServer = buildApolloServer;
