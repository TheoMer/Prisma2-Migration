import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { Context } from './type2'

const prisma = new PrismaClient({
  log: ['query'],
});
const pubsub = new PubSub();

export const createContext = (ctx: any): Context => {
  return {
    ...ctx,
    prisma,
    pubsub
  };
}
