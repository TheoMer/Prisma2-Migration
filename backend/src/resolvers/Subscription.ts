// Example taken from: https://www.prisma.io/docs/1.10/tutorials/build-graphql-servers/development/build-a-realtime-graphql-server-with-subscriptions-ien5es6ok3#3.2.-implement-the-subscription-resolver

const handleSubmitErrorSub = (err: any) => {
    console.error(err.message);
}

const Subscription = {
    order: {
        subscribe: async (parent: any, args: any, ctx: any, info: object) => {
            const orderResult = await ctx.prisma.subscription
                .order({
                    where: {
                        mutation_in: ['CREATED', 'UPDATED'],
                    },
                },
                info
            ).catch(handleSubmitErrorSub);
            //ctx.pubsub.publish(orderResult)
            //return ctx.pubsub.asyncIterator(orderResult);
            return orderResult;
        },
    },
    item: {
        subscribe: async (parent: any, args: any, ctx: any, info: object) => {
            const itemResult = await ctx.prisma.subscription
                .item({
                    where: {
                        mutation_in: ['CREATED', 'UPDATED'],
                    },
                },
                info
            ).catch(handleSubmitErrorSub);
            return itemResult;
        },
    },
    itemDeleted: {
        subscribe: (parent: any, args: any, ctx: any, info: object) => {
          const selectionSet = `{ previousValues { id, userIdentity } }`
          return ctx.prisma.subscription.item(
            {
              where: {
                mutation_in: ['DELETED'],
              },
            },
            selectionSet,
          ).catch(handleSubmitErrorSub);
        },
        resolve: (payload: any, args: any, context: any, info: object) => {
          return payload ? payload.item.previousValues : payload
        },
    },
};

module.exports = Subscription;
