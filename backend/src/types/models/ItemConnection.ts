import { objectType } from '@nexus/schema';

export const ItemConnection = objectType({
    name: 'ItemConnection',
    definition(t) {
      t.int('count', { nullable: false })
    }
})