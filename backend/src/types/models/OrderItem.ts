import { objectType } from '@nexus/schema';

export const OrderItem = objectType({
    name: 'OrderItem',
    definition(t) {
        t.model.id()
        t.model.description()
        t.model.image()
        t.model.itemid()
        t.model.largeImage()
        t.model.mainDescription()
        t.model.order()
        t.model.Order()
        t.model.price()
        t.model.quantity()
        t.model.title()
        //t.model.color()
        t.model.Color()
        //t.model.size()
        t.model.Size()
        //t.model.user()
        t.model.User()
        t.date("createdAt")
        t.date("updatedAt")
    }
})