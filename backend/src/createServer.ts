const { ApolloServer } = require('apollo-server-express');
import { createContext } from './context';
import { schema } from './schema';

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
        //context: (req: any) => ({ ...req, prisma }),
        context: createContext,
    });
}

module.exports = createServer;

