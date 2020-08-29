import { arg, idArg, stringArg, intArg, queryType} from '@nexus/schema';
const uuidv3 = require('uuid/v3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hasPermission } = require('../../utils');

export const Query = queryType({
    definition(t) {
      t.crud.item()
  
      t.crud.items({
        filtering: true,
        ordering: true,
        pagination: true,
      })
  
      t.crud.itemVariants({
        filtering: true,
        ordering: true
      })
  
      t.crud.sizes({
        filtering: true,
        ordering: true      
      })
  
      t.crud.colors({
        filtering: true,
        ordering: true
      })
      
      t.field('me', {
        type: 'User',
        nullable: true,
        resolve: async (root: any, args: any, ctx: any) => {
  
            const { userId } = ctx.req;

            // Cookie userId exists but Guest user has been deleted from table
            const userExists = await ctx.prisma.user.findOne({ where: { id: userId } })
  
            if(!userId || !userExists) {
              // create guest user
  
              // 1. Create email address
              const newUUID = process.env.NODE_ENV === 'development' ? uuidv3(process.env.FRONTEND_URL, uuidv3.URL) : uuidv3(process.env.APP_DOMAIN, uuidv3.DNS);
              const email = await bcrypt.hash(newUUID, 10) + '@guestuser.com';
              
              // 2. Create Password
              const password = await bcrypt.hash(newUUID, 10);
              const name = "Guest User";
  
              // 3. create the user in the database
              const user = ctx.prisma.user.create({
                data: {
                  id: userId,
                  name,
                  email,
                  password,
                  permissions2: { set: ['GUEST_USER'] },
                },                    
              })
  
              // create the jwt token for them
              const token = jwt.sign({ userId: ctx._user.id }, process.env.APP_SECRET);
  
              // We set the jwt as a cookie on the response
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
                
              // A user already exists
              return userExists
            }
  
          }
      })
  
      t.crud.users({
        filtering: true,
        ordering: true,
        resolve: async (root: any, args: any, ctx: any) => {
  
          const { userId } = ctx.req;

          // 1. Check if they are logged in
          if (!userId) {
            throw new Error('You must be logged in!');
          }
  
          // 2. Check if the user has the permissions to query all the users
          hasPermission(ctx._user, ['ADMIN', 'PERMISSIONUPDATE']);
  
          return ctx.prisma.user.findMany();
  
        } 
      })
  
      t.field('order', {
        type: "Order",
        nullable: true,
        args: {
          id: idArg({ nullable: false}),
        },
        resolve: async (root: any, args: any, ctx: any) => {

          const { userId } = ctx.req;

          // 1. Check if they are logged in
          if (!userId) {
            throw new Error('You must be logged in!');
          }
  
          // 2. Query the current order
          const order = await ctx.prisma.order.findOne(
            {
              where: { id: args.id },
            },
          );
  
          // 3. Check if the have the permissions to see this order
          const ownsOrder = order?.user === userId;
          const hasPermissionToSeeOrder = ctx._user.permissions.includes('ADMIN');
  
          if (!ownsOrder && !hasPermissionToSeeOrder) {
            throw new Error('You must be signed in to see your orders.');
          }
  
          return order;
  
        }
      })
  
      t.crud.orders({
        filtering: true,
        ordering: true,
        resolve: async (root: any, args: any, ctx: any) => {
  
          const { userId } = ctx.req;
  
          // 1. Make sure they are logged in
          if (!userId) {
            throw new Error('You must be signed in!');
          }
  
          // Return users
          return ctx.prisma.order.findMany({
              where: {
                user: { 
                  equals: userId 
                },
              },
          });
  
        } 
      })
  
    }
  })
  