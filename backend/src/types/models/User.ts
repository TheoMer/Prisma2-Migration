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
      t.model.cart({
        filtering: true,
        ordering: true,  
      })
      t.model.items({
        filtering: true,
        ordering: true,  
      })
      t.model.itemvariants({
        filtering: true,
        ordering: true,  
      })
      t.model.order({
        filtering: true,
        ordering: true,  
      })
      t.model.orderitem({
        filtering: true,
        ordering: true,  
      })
      t.date("createdAt")
      t.date("updatedAt")
    }
})
