import { objectType } from '@nexus/schema';

export const User = objectType({
    name: 'User',
    definition(t) {
      t.model.id()
      t.model.email()
      t.model.name()
      t.model.password()
      t.model.permissions2()
      t.model.resetToken()
      t.model.resetTokenExpiry()
      t.model.address({
        filtering: true,
        ordering: true,  
      })
      t.model.cart()
      t.model.items()
      t.model.itemvariants()
      t.model.order()
      //t.model.OrderItem()
      t.date("createdAt")
      t.date("updatedAt")
    }
})