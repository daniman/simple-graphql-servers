#!/bin/bash

rover graph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-congress | rover graph publish simple-servers@congress --schema -
rover graph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-address-enrichment | rover graph publish simple-servers@address-enrichment --schema -
rover graph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-daylight-times | rover graph publish simple-servers@daylight-times --schema -

rover subgraph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-congress | rover subgraph publish simple-servers@supergraph --name congress --schema - --routing-url https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-congress
rover subgraph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-address-enrichment | rover subgraph publish simple-servers@supergraph --name address-enrichment --schema - --routing-url https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-address-enrichment
rover subgraph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-daylight-times | rover subgraph publish simple-servers@supergraph --name daylight-times --schema - --routing-url https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-daylight-times  