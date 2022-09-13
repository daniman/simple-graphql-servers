const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const fetch = require('node-fetch');
const {
  ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');
const { ApolloServerPluginUsageReporting } = require('apollo-server-core');
const { ApolloServerPluginInlineTrace } = require('apollo-server-core');
const utils = require('../utils');

const typeDefs = gql`
  enum Party {
    """
    Democratic Party: https://en.wikipedia.org/wiki/Democratic_Party_(United_States)
    """
    D
    """
    Republican Party: https://en.wikipedia.org/wiki/Republican_Party_(United_States)
    """
    R
  }

  """
  The chambers of the [United States Congress](https://en.wikipedia.org/wiki/United_States_Congress).
  """
  enum Chamber {
    HOUSE
    SENATE
  }

  type ChamberVote {
    congress: Int
    session: Int
    chamber: String
    rollCall: Int
    source: String
    url: String
    question: String
    question_text: String
    description: String
    voteType: String
    date: String
    time: String
    result: String
    tieBreaker: String
    tieBreakerVote: String
    documentNumber: String
    documentTitle: String
    positions: [ChamberVotePosition]
    total: ChamberVoteTotal
    democratic: PartyVoteTotal
    republican: PartyVoteTotal
    independent: PartyVoteTotal
    nomination: Nomination
    bill: Bill
    amendment: Amendment
  }

  type Amendment {
    number: String
    apiUri: String
    sponsorId: ID
    sponsor: String
    sponsorUri: String
    sponsorParty: Party
    sponsorState: String
  }

  type Bill {
    billId: ID
    number: String
    title: String
    shortTitle: String
    latestAction: String
    details: BillDetails
  }

  type BillDetails {
    billId: ID
    billSlug: String
    congress: String
    bill: String
    billType: String
    number: String
    title: String
    shortTitle: String
    sponsorTitle: String
    sponsor: String
    sponsorId: ID
    # # sponsor_uri: 'https://api.propublica.org/congress/v1/members/S000148.json',
    # sponsor_party: Party
    # sponsor_state: String
    # gpo_pdf_uri: null,
    # congressdotgov_url: 'https://www.congress.gov/bill/116th-congress/senate-bill/4653',
    # govtrack_url: 'https://www.govtrack.us/congress/bills/116/s4653',
    # introduced_date: '2020-09-22',
    # active: true,
    # last_vote: '2020-10-01',
    # house_passage: null,
    # senate_passage: null,
    # enacted: null,
    # vetoed: null,
    # cosponsors: 0,
    # cosponsors_by_party: {},
    # withdrawn_cosponsors: 0,
    # primary_subject: '',
    # committees: '',
    # committee_codes: [],
    # subcommittee_codes: [],
    # latest_major_action_date: '2020-10-01',
    # latest_major_action: 'Cloture on the motion to proceed to the measure not invoked in Senate by Yea-Nay Vote. 51 - 43. Record Vote Number: 200. (CR S6015)',
    # house_passage_vote: null,
    # senate_passage_vote: null,
    # summary: '',
    # summary_short: '',
    # cbo_estimate_url: null,
    # versions: [Array],
    # actions: [Array],
    # presidential_statements: [],
    # votes: [Array]
  }

  type Nomination {
    nominationId: ID
    number: String
    name: String
    agency: String
  }

  type PartyVoteTotal {
    yes: Int
    no: Int
    present: Int
    notVoting: Int
    majorityPosition: String
  }

  type ChamberVoteTotal {
    yes: Int
    no: Int
    present: Int
    notVoting: Int
  }

  type ChamberVotePosition {
    memberId: ID
    name: String
    party: Party
    state: String
    votePosition: String
    dwNominate: Float
  }

  type MemberVote {
    memberId: ID
    chamber: String
    congress: String
    session: String
    rollCall: String
    vote: ChamberVote
    bill: BillForVote
    description: String
    question: String
    result: String
    date: String
    time: String
    total: MemberVoteTotal
    position: String
  }

  type BillForVote {
    billId: ID
    number: String
    billUrl: String
    title: String
    latestAction: String
  }

  type MemberVoteTotal {
    yes: Int
    no: Int
    present: Int
    notVoting: Int
  }

  """
  Interface to abstract the shared data returned from the congress members list
  and the individual members detail endpoint.
  """
  interface Member {
    id: ID
    firstName: String
    middleName: String
    lastName: String
    suffix: String
    dateOfBirth: String
    gender: String
    twitterAccount: String
    facebookAccount: String
    youtubeAccount: String
    votesmartId: ID
    inOffice: Boolean
    lastUpdated: String
    url: String
    rssUrl: String
    icpsrId: ID
    crpId: ID
    googleEntityId: ID
    cspanId: ID
    govtrackId: ID
    # extended
    # totalVotes: Int
  }

  """
  Metadata for each member of the United States Congress, provided by ProPublica.
  Fetched through https://api.propublica.org/congress/v1/members/\${MEMBER_ID}.json
  """
  type MemberDetails implements Member {
    # copied from Member Interface
    id: ID
    firstName: String
    middleName: String
    lastName: String
    suffix: String
    dateOfBirth: String
    gender: String
    twitterAccount: String
    facebookAccount: String
    youtubeAccount: String
    votesmartId: ID
    inOffice: Boolean
    lastUpdated: String
    url: String
    rssUrl: String
    icpsrId: ID
    crpId: ID
    googleEntityId: ID
    cspanId: ID
    govtrackId: ID

    # fields only available by requesting data from individual member endpoint
    roles: [MemberDetailsRole]
    mostRecentVote: String
    currentParty: Party
    timesTopicsUrl: String
    timesTag: String
    votes(offset: Int = 0): [MemberVote]
  }

  """
  Details for each role a member in congress might have, fetched through the member
  details endpoint: https://api.propublica.org/congress/v1/members/\${MEMBER_ID}.json
  """
  type MemberDetailsRole {
    congress: String
    chamber: String
    title: String
    shortTitle: String
    state: String
    party: Party
    leadershipRole: String
    fecCandidateId: ID
    seniority: String
    senateClass: String
    stateRank: String
    lisId: ID
    ocdId: ID
    startDate: String
    endDate: String
    office: String
    phone: String
    fax: String
    contactForm: String
    cookPvi: String
    dwNominate: String
    idealPoint: Float
    nextElection: String
    totalVotes: Int
    missedVotes: Int
    totalPresent: Int
    billsSponsored: Int
    billsCosponsored: Int
    missedVotesPct: Float
    votesWithPartyPct: Float
    votesAgainstPartyPct: Float
    # committees: [ [Object], [Object], [Object], [Object], [Object] ],
    # subcommittees: []
  }

  """
  Metadata for each member of the United States Congress, as it pertains to each session of congress.
  Fetched through https://api.propublica.org/congress/v1/{congress}/{chamber}/members.json.
  """
  type CongressMember implements Member {
    # copied from Member Interface
    id: ID
    firstName: String
    middleName: String
    lastName: String
    suffix: String
    dateOfBirth: String
    gender: String
    twitterAccount: String
    facebookAccount: String
    youtubeAccount: String
    votesmartId: ID
    inOffice: Boolean
    lastUpdated: String
    url: String
    rssUrl: String
    icpsrId: ID
    crpId: ID
    googleEntityId: ID
    cspanId: ID
    govtrackId: ID

    # fields extended by CongressMember
    title: String
    shortTitle: String
    apiUri: String
    party: Party
    leadershipRole: String
    fecCandidateId: ID
    contactForm: String
    dwNominate: Float
    seniority: String
    nextElection: String
    totalVotes: Int
    missedVotes: Int
    totalPresent: Int
    ocdId: ID
    office: String
    phone: String
    fax: String
    state: String
    senateClass: String
    stateRank: String
    lisId: ID
    missedVotesPct: Float
    votesWithPartyPct: Float
    votesAgainstPartyPct: Float
    cookPvi: String
    idealPoint: Float
  }

  type Congress {
    congress: String
    chamber: String
    numResults: Int
    offset: Int
    members: [CongressMember]
  }

  """
  A GraphQL interface for congressional data exposed by ProPublica: https://projects.propublica.org/api-docs/congress-api/.
  Congressional data is updated daily.
  Fetch an API Key from them for free: https://www.propublica.org/datastore/api/propublica-congress-api
  """
  type Query {
    congress(
      """
      Specifies which session of Congress, e.g. 116
      """
      congress: Int!
      """
      Specifies which chamber of Congress, HOUSE or SENATE
      """
      chamber: Chamber!
    ): [Congress]
    memberById(id: ID!): MemberDetails
  }
`;

const headers = {
  // Get your API Key from ProPublica (free, super easy): https://www.propublica.org/datastore/api/propublica-congress-api.
  'X-API-Key': process.env.PROPUBLICA_KEY || 'FAKE_KEY'
};

const resolvers = {
  Query: {
    congress: async (_, args) => {
      if (!args.congress)
        throw new Error('Congress session must be specified, eg. 116');
      if (!args.chamber)
        throw new Error('Congress chamber must be specified, eg. SENATE');

      return await fetch(
        `https://api.propublica.org/congress/v1/${
          args.congress
        }/${args.chamber.toLowerCase()}/members.json`,
        {
          headers
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            return data.results.map((res) => utils.snakeToCamel(res));
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    },
    memberById: async (_, args) => {
      if (!args.id)
        throw new Error(
          'Must include an ID for a member of congress to fetch.'
        );

      return await fetch(
        `https://api.propublica.org/congress/v1/members/${args.id}.json`,
        {
          headers
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            return utils.snakeToCamel(data.results[0]);
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  },
  MemberVote: {
    vote: async (parent) => {
      if (!parent.voteUri)
        throw new Error('Cannot fetch vote without MemberVote.voteUri');

      return await fetch(parent.voteUri, {
        headers
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            return utils.snakeToCamel(data.results.votes.vote);
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  },
  MemberDetails: {
    votes: async (parent, args) => {
      if (!parent.id)
        throw new Error(
          'Cannot fetch member vote data if Member.id is not requested.'
        );

      return await fetch(
        `https://api.propublica.org/congress/v1/members/${parent.id}/votes.json?offset=${args.offset}`,
        {
          headers
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            return data.results[0].votes.map((res) => utils.snakeToCamel(res));
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  },
  Bill: {
    details: async (parent, args) => {
      if (!parent.apiUri)
        throw new Error(
          'Cannot fetch member vote data if Member.id is not requested.'
        );

      return await fetch(parent.apiUri, {
        headers
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            console.log(data);
          } else {
            throw new Error('Error fetching data. Did you include an API Key?');
          }
        })
        .catch((err) => new Error(err));
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginInlineTrace()]
});

const getHandler = (event, context) => {
  const server = new ApolloServer({
    apollo: {
      graphRef: 'simple-servers@congress'
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
