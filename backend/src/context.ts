import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { Request } from 'apollo-server-express';

const prisma = new PrismaClient();

export interface Context {
  req: Request & any;
  prisma: PrismaClient;
  pubsub: PubSub;
}

const pubsub = new PubSub();

export function createContext(req: Request, ctx: any): Context {
  return {
    ...ctx,
    ...req,
    prisma,
    pubsub
  };
}
