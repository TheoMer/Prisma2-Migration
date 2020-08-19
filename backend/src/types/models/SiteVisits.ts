import { objectType } from '@nexus/schema';

export const SiteVisits = objectType({
    name: 'SiteVisits',
    definition(t) {
        t.model.id()
        t.model.url()
        t.model.urlReferer()
        t.model.userAgent()
        t.model.userID()
        t.model.userIP()
        t.model.userType()
        t.date("createdAt")
        t.date("updatedAt")
    }
})