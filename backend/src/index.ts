const path = process.env.NODE_ENV === 'production' ? 'variables.production.env' : 'variables.env';
require('dotenv').config({ path });
const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwtt = require('jsonwebtoken');
const PORT = process.env.PORT;
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createServerInd = require('./createServer');

const server = createServerInd();
const app = express();

app.use(cookieParser());

// 1. decode the jwtt so we can get the user Id on each request
app.use((req: any, res: any, next: any) => {

    const { token, uuid } = req.cookies;
    //console.log("token = ", token);
    //console.log("uuid = ", uuid);

    //req.userId = 'cjo7q048b000408312h9c2fo0';

    if(token) {

        try {

          const { userId } = jwtt.verify(token, process.env.APP_SECRET);
          console.log("UserId = ", userId);
        
          // Put the userId onto the req for future requests to access
          req.userId = userId;

        } catch (e) {

          // No valid userId exists
          req.userId = '-1';

        }
    }
    if(uuid) {
      const { logId } = jwtt.verify(uuid, process.env.APP_SECRET);
      // put the userId onto the req for future requests to access
      req.logId = uuid;
    }
    next();
});

// 2. create a middleware that populates the ueer on each request
app.use(async (req: any, res: any, next: any) => {


    // if they aren't logged in, skip this
    if (!req.userId) return next();

    try {

      const user = await prisma.user.findOne({ 
        where: { 
          id: req.userId 
        } 
      });

      req.user = user;
      //console.log("User = ", req.user);

    } catch (e) {

      console.log(`The user query failed because: ${e}`);
      req.user = null;

    }

    next();
});

server.applyMiddleware({
  app, 
  path: '/graphql',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
 });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// start it!!
httpServer.listen(PORT, (err: any) => {
  if (err) throw err
  console.log(`🚀 Server ready at ${process.env.NODE_ENV === 'development'? `http://${process.env.BACKEND_HOSTNAME}` : `https://${process.env.BACKEND_HOSTNAME}`}:${PORT}${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ${process.env.NODE_ENV === 'development'? `ws://${process.env.BACKEND_HOSTNAME}` : `wss://${process.env.BACKEND_HOSTNAME}`}:${PORT}${server.subscriptionsPath}`)
});

