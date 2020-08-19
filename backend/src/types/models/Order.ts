import { objectType } from '@nexus/schema';

export const Order = objectType({
    name: 'Order',
    definition(t) {
        t.model.id()
        t.model.address_line()
        t.model.card_brand()
        t.model.card_name()
        t.model.charge()
        t.model.city()
        t.model.country()
        t.model.last4card_digits()
        t.model.postcode()
        t.model.total()
        //t.model.user()
        t.model.User()
        t.model.items({
          filtering: true,
          ordering: true,
        })
        t.date("createdAt")
        t.date("updatedAt")
    }
})