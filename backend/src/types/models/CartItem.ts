import { objectType } from '@nexus/schema';

export const CartItem = objectType({
  name: 'CartItem',
  definition(t) {
      t.model.id()
      t.model.quantity()
      t.model.item()
      t.model.Item()
      t.model.itemvariants()
      t.model.ItemVariants()
      t.model.user()
      t.model.User()
      t.date("createdAt")
      t.date("updatedAt")
  }
})