const { gql } = require('apollo-server');
const { delayFetch, buildApolloServer } = require('../utils/utils');

const DELAY_MULTIPLIER = 1;

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  """
  Moon phase data from https://docs.astronomyapi.com/endpoints/studio/moon-phase
  All times shown in UTC
  """
  type Location @key(fields: "latitude longitude") {
    latitude: Float
    longitude: Float
    moonPhaseImg: String
  }
`;

const resolvers = {
  Location: {
    __resolveReference: async ({ latitude, longitude }, { delay }) => {
      return await delayFetch(
        'https://api.astronomyapi.com/api/v2/studio/moon-phase',
        {
          delay: delay * DELAY_MULTIPLIER,
          method: 'POST',
          body: JSON.stringify({
            format: 'svg',
            style: {
              moonStyle: 'default',
              backgroundStyle: 'stars',
              headingColor: 'white',
              textColor: 'white'
            },
            observer: {
              latitude,
              longitude,
              date: [
                new Date().getFullYear(),
                (new Date().getMonth() + 1).toLocaleString('en-US', {
                  minimumIntegerDigits: 2
                }),
                new Date()
                  .getDate()
                  .toLocaleString('en-US', { minimumIntegerDigits: 2 })
              ].join('-')
            },
            view: {
              type: 'landscape-simple',
              orientation: 'south-up'
            }
          }),
          headers: {
            Authorization: `Basic ${process.env.ASTRONOMY_KEY}`
          }
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const response = await res.json();
            return {
              latitude,
              longitude,
              moonPhaseImg: response.data.imageUrl
            };
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  }
};

const server = buildApolloServer('astronomy', typeDefs, resolvers);

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
      port: process.env.PORT || 4006
    })
    .then(({ url }) => {
      console.log(`🚀  Server is running on ${url}`);
    });
}
