import { objectType } from '@nexus/schema';

export const Size = objectType({
    name: 'Size',
    definition(t) {
      t.model.id()
      t.model.name()
      t.model.label()
      t.model.item({
        filtering: true,
        ordering: true,
      })
      t.model.itemvariants({
        filtering: true,
        ordering: true,
      })
      t.model.orderitem({
        filtering: true,
        ordering: true,
      })
      t.date("createdAt")
      t.date("updatedAt")
    },
})