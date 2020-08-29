const { ApolloServer, gql } = require('apollo-server-express');
import { createContext } from './context';
import { schema } from './schema';
//import { PrismaClient } from '@prisma/client';
//import { PubSub } from 'graphql-subscriptions';

//const prisma = new PrismaClient();

// Create the Apollo Server
function createServer() {

    return new ApolloServer({

        schema,
        subscriptions: {
          keepAlive: 1000,
          path: '/subscriptions',
        },
        playground: process.env.NODE_ENV === 'production' ? false : '/',
        tracing: true,
        introspection: true,
        //context: (req: any) => ({ ...req, prisma, PubSub }),
        context: createContext,
    });
}

module.exports = createServer;

