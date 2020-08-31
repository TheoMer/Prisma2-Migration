import { objectType } from '@nexus/schema';

export const Address = objectType({
    name: 'Address',
    definition(t) {
        t.model.id()
        t.model.address_line()
        t.model.card_name()
        t.model.city()
        t.model.country()
        t.model.postcode()
        t.model.user()
        t.model.User()
        t.date("createdAt")
        t.date("updatedAt")
    }
})