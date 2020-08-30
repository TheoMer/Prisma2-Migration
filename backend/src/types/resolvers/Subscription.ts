import { stringArg, subscriptionField } from '@nexus/schema';
import { withFilter } from 'apollo-server-express';

/*export const Subscription = subscriptionField('latestPost', {
    type: 'Post',
    subscribe(_root, _args, ctx) {
      return ctx.pubsub.asyncIterator('latestPost')
    },
    resolve(payload) {
      return payload
    },
})*/

export const ItemDeleted = subscriptionField('itemDeleted', {
    type: 'Item',
    /*args: {
      userId: stringArg({ nullable: false }),
    },*/
    subscribe: withFilter(
      (_, args: any, ctx: any) => {
        const { pubsub } = ctx;
        return pubsub.asyncIterator('itemDeleted');
      },
      (payload: any, args: any, ctx: any) => {
        const { userId } = ctx;
        return payload.id === userId;
      },
    ),
    resolve: (payload) => {
      return payload;
    },
});

export const ItemWatch = subscriptionField('itemWatch', {
    type: 'Item',
    /*args: {
      userId: stringArg({ nullable: false }),
    },*/
    subscribe: withFilter(
      (_, args: any, ctx: any) => {
        const { pubsub } = ctx;
        return pubsub.asyncIterator('itemWatch');
      },
      (payload: any, args: any, ctx: any) => {
        const { userId } = ctx;
        return payload.id === userId;
      },
    ),
    resolve: (payload) => {
      return payload;
    },
});

