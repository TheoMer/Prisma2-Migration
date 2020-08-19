import { asNexusMethod, enumType } from '@nexus/schema';
import { GraphQLDate } from 'graphql-iso-date';

export const Permission2 = enumType({
    name: 'Permission2',
    members: [ "ADMIN", "USER", "GUEST_USER", "ITEMCREATE", "ITEMUPDATE", "ITEMDELETE", "PERMISSIONUPDATE"]
})

export const DateTime = GraphQLDate;
export const GQLDate = asNexusMethod(GraphQLDate, "date", "Date");