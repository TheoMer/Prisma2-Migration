import * as path from 'path';
import * as types from './types';
import { join } from 'path'
import { Context } from './types2'

import { makeSchema } from '@nexus/schema';
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema';

const nexusPrisma = nexusSchemaPrisma({
    experimentalCRUD: true,
    paginationStrategy: 'prisma',
    prismaClient: (ctx: Context) => ctx.prisma,
  })

export const schema = makeSchema({
  types,
  //plugins: [nexusSchemaPrisma()],
  plugins: [nexusPrisma],
  outputs: {
    schema: path.join(__dirname, './../schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
      {
        source: join(__dirname, 'types2.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
}); 
 