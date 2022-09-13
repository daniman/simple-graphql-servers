#!/bin/bash

rover graph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-congress | rover graph publish simple-servers@congress --schema -
rover graph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-address-enrichment | rover graph publish simple-servers@address-enrichment --schema -
rover graph introspect https://simple-graphql-servers.netlify.app/.netlify/functions/subgraph-daylight-times | rover graph publish simple-servers@daylight-times --schema -