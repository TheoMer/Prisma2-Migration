import { objectType } from '@nexus/schema';

export const ItemModifier = objectType({
    name: 'ItemModifier',
    definition(t) {
      t.field('item', { type: 'Item' })
      t.string('type')
    },
  })