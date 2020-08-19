
const constitemSubscribe = (parent: any, args: any, ctx: any, info: object) => {
    return ctx.pubsub.asyncIterator("NEW_ITEM")
}

const item = {
    subscribe: constitemSubscribe,
    resolve: (payload: any) => {
        return payload
    },
}

const orderSubscribe = async (parent: any, args: any, ctx: any, info: object) => {
    return ctx.pubsub.asyncIterator('order')
}

const order = {
    subscribe: orderSubscribe,
    resolve: (payload: any) => {
        const userOrdersProcessed = JSON.parse(JSON.stringify(payload));
        console.log("Order Payload = ", userOrdersProcessed);
        return userOrdersProcessed;
    },
}

const itemDeletedSubscribe = (parent: any, args: any, ctx: any, info: object) => {
    return ctx.pubsub.asyncIterator("DELETED")
}

const itemDeleted = {
    subscribe: itemDeletedSubscribe,
    resolve: (payload: any) => {
        return payload
    },
}

module.exports = {
    item,
    order,
    itemDeleted
}
