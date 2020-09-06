import { stringArg, subscriptionField } from '@nexus/schema';
import { withFilter } from 'apollo-server-express';

export const ItemWatch = subscriptionField('itemWatch', {
    type: 'Item',
    subscribe(_root, _args, ctx) {
      const { pubsub } = ctx;
      return pubsub.asyncIterator('itemWatch');
    },
    resolve(payload) {
      return payload
    },
});
