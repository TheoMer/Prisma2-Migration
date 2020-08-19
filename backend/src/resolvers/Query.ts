const { forwardTo } = require('prisma-binding');
const jwttt = require('jsonwebtoken');
const uuidv33 = require('uuid/v3');
const bcryptt = require('bcryptjs');
const { hasPermission: hasPermissionsOtherOne } = require('../utils');

const handleSubmitError = (err: any) => {
  console.error(err.message);
}

const Query = {
    items: forwardTo('prisma'),
    item: forwardTo('prisma'),
    itemsConnection: forwardTo('prisma'),
    itemVariants: forwardTo('prisma'),
    sizes: forwardTo('prisma'),
    colors: forwardTo('prisma'),
    async me(parent: any, args: any, ctx: any, info: object) {

        // Cookie userId exists but Guest user has been deleted from table
        const userExists = await ctx.prisma.query.user({ where: { id: ctx.req.userId } }, info).catch(handleSubmitError);

        // Check if there is a current user ID
        //if(!ctx.req.userId || !userExists) {
        if (userExists === null || userExists === undefined) {
            // create guest user
            // 1. Create email address
            const newUUID = process.env.NODE_ENV === 'development' ? uuidv33(process.env.FRONTEND_URL, uuidv33.URL) : uuidv33(process.env.APP_DOMAIN, uuidv33.DNS);
            const email = await bcryptt.hash(newUUID, 10) + '@guestuser.com';
            // 2. Create Password
            const password = await bcryptt.hash(newUUID, 10);
            const name = "Guest User";
            // 3. create the user in the database
            const user = await ctx.prisma.mutation.createUser(
              {
                data: {
                  name,
                  email,
                  password,
                  permissions: { set: ['GUEST_USER'] },
                },
              },
              info
            ).catch(handleSubmitError);
            // create the jwttt token for them
            const token = jwttt.sign({ userId: user.id }, process.env.APP_SECRET);
            // We set the jwttt as a cookie on the response
            ctx.res.cookie('token', token, {
              //Set domain to custom domain name to resolve issue with non custom heroku/now domain names
              domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN,
              secure: process.env.NODE_ENV === 'development' ? false : true,
              httpOnly: true,
              maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
              sameSite: 'lax',
            });

            return user;

        } else {

          // Return existing user details
          return userExists;

        }
    },
    async users(parent: any, args: any, ctx: any, info: object) {
        // 1. Check if they are logged in
        if (!ctx.req.userId) {
          throw new Error('You must be logged in!');
        }
        // 2. Check if the user has the permissions to query all the users
        hasPermissionsOtherOne(ctx.req.user, ['ADMIN', 'PERMISSIONUPDATE']);
    
        // 2. if they do, query all the users!
        return ctx.prisma.query.users({}, info);
    },
    async order(parent: any, args: any, ctx: any, info: object) {
        // 1. Make sure they are logged in
        if (!ctx.req.userId) {
          throw new Error('You arent logged in!');
        }
        // 2. Query the current order
        const order = await ctx.prisma.query.order(
          {
            where: { id: args.id },
          },
          info
        ).catch(handleSubmitError);
        // 3. Check if the have the permissions to see this order
        const ownsOrder = order.user.id === ctx.req.userId;
        const hasPermissionToSeeOrder = ctx.req.user.permissions.includes('ADMIN');
        if (!ownsOrder && !hasPermissionToSeeOrder) {
          throw new Error('You must be signed in to see your orders.');
        }
        // 4. Return the order
        return order;
    },
    async orders(parent: any, args: any, ctx: any, info: object) {
        const { userId } = ctx.req;
        if (!userId) {
          throw new Error('You must be signed in!');
        }
        return ctx.prisma.query.orders(
          {
            where: {
              user: { id: userId },
            },
          },
          info
        ).catch(handleSubmitError);
    },
};

module.exports = Query;
