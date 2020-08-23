import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { Request } from 'apollo-server-express';
import { Context } from './type2'

const prisma = new PrismaClient();
const pubsub = new PubSub();

export function createContext(ctx: any): Context {
  return {
    ...ctx,
    prisma,
    pubsub
  };
}
