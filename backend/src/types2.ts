import { PrismaClient } from '@prisma/client'
import { PubSub } from 'apollo-server-express'
import { Request, Response } from 'express'

export interface Context {
  prisma: PrismaClient
  req: Request
  res: Response
  pubsub: PubSub
}
