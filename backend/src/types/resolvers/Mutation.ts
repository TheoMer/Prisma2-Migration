import { arg, idArg, stringArg, intArg, mutationType} from '@nexus/schema';
const jwt = require('jsonwebtoken');
const uuidv3 = require('uuid/v3');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail, orderRequest, mailReceipt } = require('../../mail');
const stripe = require('../../stripe');
const cloudinary = require('cloudinary');
const { hasPermission } = require('../../utils');

const handleSubmitErr = (err: any) => {
    console.error(err.message);
}

export const Mutation = mutationType({
    definition(t) {
  
      t.crud.createOneItem({
        alias: 'createItem',
        resolve: async (root: any, args: any, ctx: any) => {

          const { userId } = ctx.req
  
          const newItem = await ctx.prisma.item.create(
            {
              data: {
                User: {
                  connect: {
                    id: userId
                  }
                },
                ...args           
              },
            },
          ).catch(handleSubmitErr);

          // Manually add that an item was created
          newItem.push({
            mutation: 'CREATED'
          });

          ctx.pubsub.publish('itemWatch', newItem);
          return newItem;
        }
      })
  
      t.field('createAddress', {
        type: 'Address',
        nullable: false,
        args: {
          userId: stringArg({ nullable: false}), 
          email: stringArg({ nullable: false}), 
          address_line: stringArg({ nullable: false}),
          city: stringArg({ nullable: false}), 
          postcode: stringArg({ nullable: false}), 
          country: stringArg({ nullable: false}), 
          card_name: stringArg({ nullable: false}),
        },
        resolve: async (root: any, args: any, ctx: any) => {

          const {userId } = ctx.req;
  
          // 1. Make sure they are logged in
          if (!userId) {
            throw new Error('You must be signed in!');
          }
  
          // 2. check that a different user with that email does not exist
          const users = await ctx.prisma.user.findMany(
            {
              where: {
                email: args.email,
                AND: {
                  id: {
                    not: args.userId,
                  }
                }
              }
            },
          ).catch(handleSubmitErr);
  
          // I'm having to check the users.length as am [Object: null prototype] is returned
          // See: https://stackoverflow.com/questions/53983315/is-there-a-way-to-get-rid-of-object-null-prototype-in-graphql
  
          if (users != null) {
            throw new Error(`A user with this email currently exists. Please select a different one.`);
          }
  
          // 3. Update the permissions
          await ctx.prisma.user.update({
            data: {
              email: args.email,
              name: args.card_name,
            },
            where: {
              id: args.userId,
            },
          }).catch(handleSubmitErr);
  
          // 4. create an address for the user
  
          // remove the id and email from args
          delete args.userId;
          delete args.email;
  
          const address = await ctx.prisma.address.create({
            data: {
              User: {
                connect: {
                  id: userId,
                },
              },
              //id: '-1',  // An error is issued on data: if I don't add an id
              ...args,
            },
          }).catch(handleSubmitErr);
  
          // add the email to the return object
          return address;
  
        }
      })
  
      t.field('updateAddress', {
        type: 'Address',
        nullable: false,
        args: {
          userId: idArg({ nullable: false}), 
          email: stringArg({ nullable: false}), 
          address_line: stringArg({ nullable: false}),
          city: stringArg({ nullable: false}), 
          postcode: stringArg({ nullable: false}), 
          country: stringArg({ nullable: false}), 
          card_name: stringArg({ nullable: false}),
        },
        resolve: async (root: any, args: any, ctx: any) => {

          const { userId } = ctx.req;
  
          // Update the user details
          await ctx.prisma.user.update({
            data: {
              email: args.email,
              name: args.card_name,
            },
            where: {
              id: userId, //args.userId,
            },
          }).catch(handleSubmitErr);
  
          // remove the id and email from args
          let addressID = args.userId; // taken from userUpdateID in MyAccount.js
          delete args.userId;
          delete args.email;
  
          // run the update method
          return ctx.prisma.address.update({
            data: {...args},
            where: {
              id: addressID,
            },
          }).catch(handleSubmitErr);
  
        }      
      })
  
      t.field('createSiteVisits', {
        type: 'SiteVisits',
        nullable: true,
        args: {
          userID: stringArg({ nullable: true}), 
          userType: stringArg({ nullable: true}), 
          url: stringArg({ nullable: true}), 
          userAgent: stringArg({ nullable: true}), 
          userIP: stringArg({ nullable: true}), 
          urlReferer: stringArg({ nullable: true})
        },
        resolve: async (root: any, args: any, ctx: any) => {
  
          const item = await ctx.prisma.siteVisits.create({
            data: {
              //id: '-1',
              ...args,
            },
          })
      
          return item;
  
        }
      })
  
      t.field('updateItem', {
        type: 'Item',
        nullable: false,
        args: {
          id: stringArg({ nullable: false }),
          title: stringArg({ nullable: false}), 
          description: stringArg({ nullable: false}), 
          mainDescription: stringArg({ nullable: false}), 
          price: intArg({ nullable: false }), 
          quantity: intArg({ nullable: false }),
          image: stringArg({ nullable: true}), 
          largeImage: stringArg({ nullable: true}),
          size: arg({ type: "SizeCreateOneWithoutItemInput" }), 
          color: arg({ type: "ColorCreateOneWithoutItemInput"}),
        },
        resolve: async (root: any, args: any, ctx: any) => {
  
          // remove the id and email from args
          delete args.id;
  
          // run the update method
          const updateItem =  await ctx.prisma.item.update(
            {
              data: {
                ...args,
              },
              where: {
                id: args.id,
              },
            }
          ).catch(handleSubmitErr);

          // Manually add that an item was updated
          updateItem.push({
            mutation: 'UPDATED'
          });

          ctx.pubsub.publish('itemWatch', updateItem);
          return updateItem;
  
        }
      })
  
      t.field('deleteItem', {
        type: 'Item',
        nullable: true,
        args: {
          id: stringArg({ nullable: false }),
        },
        resolve: async (root: any, args: any, ctx: any) => {
          
          const { userId } = ctx.req;

          const where = { id: args.id };
          // 1. find the item
          const item = await ctx.prisma.item.findOne({ where }); //`{ id title image largeImage user { id }}`);
          
          // 2. Check if they own that item, or have the permissions
          const ownsItem = item?.user === userId;
          const hasPermissions = ctx.prisma.user.permissions2.some((permission2: any) =>
            ['ADMIN', 'ITEMDELETE'].includes(permission2)
          );
      
          if (!ownsItem && !hasPermissions) {
            throw new Error("You don't have permission to do that!");
          }
      
          // 3a. Update the userIdentity to reflect the user and that a button was clicked
          await ctx.prisma.item.update({
            data: {
              userIdentity: `${userId}-button`
            },
            where: {
              id: args.id,
            },
          }).catch(handleSubmitErr);
      
          // 3b. Delete it!
          const deletedItem = await ctx.prisma.item.delete({ 
            where 
          }).catch(handleSubmitErr);
      
          // 4. If the item was deleted from db, delete image from Cloudinary
          if (deletedItem) {
            cloudinary.config({
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET
            });
            const file = item?.image?.substr(60).replace('.jpg', '');
            await cloudinary.uploader.destroy(file);
          }

          // Manually add that an item was deleted
          deletedItem.push({
            mutation: 'DELETED'
          });

          ctx.pubsub.publish('itemDeleted', deletedItem);
          return deletedItem;
  
        }
      })
  
      t.field('signup', {
        type: 'User',
        nullable: false,
        args: {
          email: stringArg({ nullable: false }), 
          password: stringArg({ nullable: false }), 
          name: stringArg({ nullable: false }), 
        },
        resolve: async (root: any, args: any, ctx: any) => {
          
          const { userId } = ctx.req;
          let user;
  
          // Check that the email and password aren't empty
          if (args.email.length == 0) {
            throw new Error('A valid email address is required.');
          }
          if (args.password.length == 0) {
            throw new Error('A valid password is required.');
          }
  
          // lowercase their email
          args.email = args.email.toLowerCase();
  
          // hash their password
          const password = await bcrypt.hash(args.password, 10);
  
          // delete un-hased password from args
          delete args.password;
  
          // If userId already exists and the user has guest_user permissions then
          // update the existing user details with the new user details
          const hasPermissions = ctx.req.user.permissions2.some((permission2: any) =>
            ['GUEST_USER'].includes(permission2));
  
          if (userId && hasPermissions) {

            // Update the permissions
            user = await ctx.prisma.user.update({
              data: {
                ...args,
                password,
                permissions2: {
                  set: ['USER'],
                },
              },
              where: {
                id: userId,
              },
            }).catch(handleSubmitErr);

          } else {
            
            // Check if a user with this mail already exists
            const emailTest = args.email;
  
            // You may get an error because of email: emailTest. If so revert back to just
            // where { emailTest }
            const userTest = await ctx.prisma.user.findOne({ 
              where: { email: emailTest } 
            }).catch(handleSubmitErr);
  
            if (userTest != null) {
              throw new Error(`A user with the email: ${emailTest} already exists.`);
            }

            // create the user in the database
            user = await ctx.prisma.user.create(
              {
                data: {
                  //id: '-1', // May have to comment this line out if -1 is returned as the user id
                  ...args,
                  password,
                  permissions2: { set: ['USER'] },
                },
              }
            ).catch(handleSubmitErr);
      
            // create the JWT token for them
            const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
            // We set the jwt as a cookie on the response
            ctx.res.cookie('token', token, {
              //Set domain to custom domain name to resolve issue with non custom heroku/now domain names
              domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN,
              secure: process.env.NODE_ENV === 'development' ? false : true,
              httpOnly: true,
              maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
              sameSite: 'lax',
            });
          }
  
          // Finalllllly we return the user to the browser
          return user;
  
        }
      })
  
      t.field('signin', {
        type: 'User',
        nullable: false,
        args: {
          email: stringArg({ nullable: false }), 
          password: stringArg({ nullable: false }),         
        },
        resolve: async (root: any, { email, password }: {email: any, password: any}, ctx: any) => {
          
          let user: any;
          const { userId } = ctx.req;
          //console.log("userId = ", userId);
          //console.log("User  = ", ctx.req.user);
          
          //Check that the email and password aren't empty
          if (email.length == 0) {
            throw new Error('A valid email address is required.');
          }
  
          if (password.length == 0) {
            throw new Error('A valid password is required.');
          }
  
          // get cart information for the current user
          const cart = await ctx.prisma.cartItem.findMany({
            where: {
              user: {
                equals: userId
              }
            }
          }).catch(handleSubmitErr);
  
          // Get user's permission rights
          const hasPermissions = ctx.req.user.permissions2.some((permission2: any) => ['GUEST_USER'].includes(permission2));
  
          // 1. check if there is a user with that email
          user = await ctx.prisma.user.findOne({
            where: { email: email },
          }).catch(handleSubmitErr);
  
          if (!user) {
            throw new Error(`No such user found for email ${email}`);
          }
  
          // 2. Check if their password is correct
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) {
            throw new Error('Invalid Password!');
          }
  
          // 3. Copy guest_user cart if they have items in it
          if (userId && hasPermissions && cart != null) {
            console.log("Yes! We are here!!");
            
            let cartItemz = {};
            cart.map(async (cartVal: any, index: any) => {
  
              //console.log("Itemvariants id = ", await cartVal.itemvariants);
              let registered_userCart = await ctx.prisma.cartItem.findMany(
                {
                  where: {
                    user: {
                      equals: user.id   
                    },
                    itemvariants: {
                      equals: cartVal.itemvariants 
                    },
                  },
                },
              ).catch(handleSubmitErr);
  
              // Check whether the guest_user cart item exists in the registered User's cart
              if (registered_userCart) {
  
                // Update the User cart item quantity
                ctx.prisma.cartItem.update({
                  data: { 
                    quantity: registered_userCart.quantity + cartVal.quantity 
                  },
                  where: { 
                    id: registered_userCart.id
                  },
                }).catch(handleSubmitErr);
  
              }else{
                // Write the guest_user item to the User's cart
                cartItemz = {
                  user: {
                    connect: { id: user.id }
                  },
                  quantity: cartVal.quantity,
                  itemvariants: {
                    connect: { id: cartVal.itemvariants },
                  },
                  item: {
                    connect: { id: cartVal.item },
                  },
                };
  
                ctx.prisma.item.create({
                  data: cartItemz
                }).catch(handleSubmitErr);
              }
            })
          }
  
          // 4. Transfer a guest_users's orders to the registered user logging in
          // if any exists
          const userOrders = await ctx.prisma.order.findMany(
            {
              where: {
                user: { 
                  equals: userId 
                },
              },
            }
          ).catch(handleSubmitErr);
  
          if (ctx.req.userId && hasPermissions && userOrders != null) {
              const orderItems = userOrders.items.map((orderItemFromOrder: any) => {
  
                // Construct the orderItems list
                const orderItem = {
                  id: orderItemFromOrder.itemid,
                  user: { connect: { id: user.id } },
                  itemid: orderItemFromOrder.itemid,
                  title: orderItemFromOrder.title,
                  description: orderItemFromOrder.description,
                  mainDescription: orderItemFromOrder.mainDescription,
                  price: orderItemFromOrder.price,
                  image: orderItemFromOrder.image,
                  largeImage: orderItemFromOrder.largeImage,
                  quantity: orderItemFromOrder.quantity,
                  color: { connect: { name: orderItemFromOrder.color.name } },
                  size: { connect: { name: orderItemFromOrder.size.name } }
                };
      
                delete orderItem.id;
                return orderItem;
              });
  
              // Create the newly transfered order
              ctx.prisma.order.create({
                data: {
                  //id: '-1',   
                  total: userOrders.total,
                  charge: userOrders.charge,
                  card_brand: userOrders.card_brand,
                  last4card_digits: userOrders.last4card_digits,
                  items: { create: orderItems },
                  User: { connect: { id: user.id } },
                  address_line: userOrders.address_line,
                  city: userOrders.city,
                  postcode: userOrders.postcode,
                  country: userOrders.country,
                  card_name: userOrders.card_name,
                },
              }).catch(handleSubmitErr);
          }
          
          // 5. Transfer user address only if an address for the user doesn't already exist
          if (user.address === null) {
            const userAddress = await ctx.prisma.address.findMany({
              where: {
                user: { 
                  equals: userId
                },
              },
            }).catch(handleSubmitErr);
        
            // create new address object
            if (ctx.req.userId && hasPermissions && userAddress != null) {
              ctx.prisma.address.create({
                data: {
                  //id: '-1',   
                  User: { connect: { id: user.id } },
                  address_line: userAddress.address_line,
                  city: userAddress.city,
                  postcode: userAddress.postcode,
                  country: userAddress.country,
                  card_name: userAddress.card_name,
                },
              }).catch(handleSubmitErr);
            }
          }
  
          // 6. Delete guest_user
          if (userId && hasPermissions) {
            await ctx.prisma.user.delete({
              where: { id: userId },
            }).catch(handleSubmitErr);
  
            // Delete existing gues_user cookie
            await ctx.res.clearCookie('token', { domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN });
          }
  
          // 7. generate the JWT Token
          const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
  
          // 8. Set the cookie with the token
          ctx.res.cookie('token', token, {
            //Set domain to custom domain name to resolve issue with non custom heroku/now domain names
            domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN,
            secure: process.env.NODE_ENV === 'development' ? false : true,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
            sameSite: 'lax',
          });
  
          // 9. Return the user
          return user;
        
        }
      })
  
      t.field('signout', {
        type: "SuccessMessage",
        nullable: true,
        resolve: async (root: any, args: any, ctx: any) => {
          
          // Set logged out flag
          // 1. Generate number
          const newUUID = process.env.NODE_ENV === 'development' ? uuidv3(process.env.FRONTEND_URL, uuidv3.URL) : uuidv3(process.env.APP_DOMAIN, uuidv3.DNS);
          
          // 2. generate the JWT UUID
          const logid = jwt.sign({ logId: newUUID }, process.env.APP_SECRET);
          
          // 3. Set the cookie with the uuid
          await ctx.res.cookie('uuid', logid, {
            //Set domain to custom domain name to resolve issue with non custom heroku/now domain names
            domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN,
            secure: process.env.NODE_ENV === 'development' ? false : true,
            httpOnly: true,
            maxAge: 5 * 1000, //Set time for 5 seconds
            sameSite: 'lax',
          });
          
          await ctx.res.clearCookie('token', { domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN });
          
          return { message: 'Goodbye!' };
        
        }      
      })
  
      t.field('requestReset', {
        type: "SuccessMessage",
        nullable: true,
        args: {
          email: stringArg({ nullable: false }), 
        },
        resolve: async (root: any, args: any, ctx: any) => {
          
          //Check that the email isn't empty
          if (args.email.length == 0) {
            throw new Error('A valid email address is required.');
          }
  
          // 1. Check if this is a real user
          const user = await ctx.prisma.user.findOne({ where: { email: args.email } });
          if (!user) {
            throw new Error(`No such user found for email ${args.email}`);
          }
  
          // 2. Set a reset token and expiry on that user
          const randomBytesPromiseified = promisify(randomBytes);
          const resetToken = (await randomBytesPromiseified(20)).toString('hex');
          const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
          const res = await ctx.prisma.user.update({
            where: { email: args.email },
            data: { resetToken, resetTokenExpiry },
          }).catch(handleSubmitErr);
  
          // 3. Email them that reset token
          const mailRes = await transport.sendMail({
            from: 'techsupport@wflamingo.com',
            to: user.email,
            subject: 'Your Password Reset Token',
            html: makeANiceEmail(`Your Password Reset Token is here!
            \n\n
            <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
          }).catch(handleSubmitErr);
  
          // 4. Return the message
          return { message: 'Thanks!!' };
        
        }      
      })
  
      t.field('resetPassword', {
        type: "User",
        nullable: false,
        args: {
          resetToken: stringArg({ nullable: false }),
          password: stringArg({ nullable: false }),
          confirmPassword: stringArg({ nullable: false })
        },
        resolve: async (root: any, args: any, ctx: any) => {
          
          // 1. check if the passwords match
          if (args.password !== args.confirmPassword) {
            throw new Error("Your Passwords don't match!");
          }
  
          // 2. check if its a legit reset token
          // 3. Check if its expired
          const user = await ctx.prisma.user.findMany({
            where: {
              resetToken: args.resetToken,
              resetTokenExpiry: {
                gte: Date.now() - 3600000,
              }
            },
          }).catch(handleSubmitErr);
  
          if (!user) {
            throw new Error('This token is either invalid or expired!');
          }
  
          // 4. Hash their new password
          const password = await bcrypt.hash(args.password, 10);
  
          // 5. Save the new password to the user and remove old resetToken fields
          const updatedUser = await ctx.prisma.user.update({
            where: { email: user.email },
            data: {
              password,
              resetToken: null,
              resetTokenExpiry: null,
            },
          }).catch(handleSubmitErr);
  
          // 6. Generate JWT Note: if it errors on updatedUser then try updatedUser.id
          const token = jwt.sign({ userId: updatedUser }, process.env.APP_SECRET);
  
          // 7. Set the JWT cookie
          ctx.res.cookie('token', token, {
            // Set domain to custom domain name to resolve issue with non custom heroku/now domain names
            domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN,
            secure: process.env.NODE_ENV === 'development' ? false : true,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
            sameSite: 'lax',
          });
  
          // 8. return the new user
          return updatedUser;
        
        }      
      })
  
      t.field('updatePermissions', {
        type: "User",
        nullable: true,
        args: {
          permissions2: arg({ type: "Permission2", list: true }),
          userId: stringArg({ nullable: false }),
        },
        resolve: async (root: any, args: any, ctx: any) => {
          
          const { userId } = ctx.req;
  
          // 1. Make sure they are logged in
          if (!userId) {
            throw new Error('You must be signed in!');
          }
  
          // 2. Query the current user
          const currentUser = await ctx.prisma.user.findOne({
              where: {
                id: userId,
              },
          })
  
          // 3. Check if they have permissions to do this
          hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
  
          // 4. Update the permissions
          return await ctx.prisma.user.update({
            data: {
              permissions2: {
                set: args.permissions2,
              },
            },
            where: {
              id: args.userId,
            },          
          }).catch(handleSubmitErr);
        
        }
      })
  
      t.field('updateGuestEmail', {
        type: "User",
        nullable: false,
        args: {
          userId: stringArg({ nullable: false }),
          email: stringArg({ nullable: false }), 
        },
        resolve: async (root: any, args: any, ctx: any) => {

          const { userId } = ctx.req;
  
          //Check that the email and password aren't empty
          if (args.email.length == 0) {
            throw new Error('A valid email address is required.');
          }
  
          // 1. Check if they are logged in 
          if (!userId) {
            throw new Error('You must be logged in!');
          }
  
          // 2. check that a different user with that email does not exist
          const users = await ctx.prisma.user.findMany(
            {
              where: {
                email: args.email,
                AND: {
                  id: {
                    not: args.userId,
                  }
                }
              }
            },
          ).catch(handleSubmitErr);
  
          if (users != null) {
            throw new Error(`A user with this email currently exists. Please select a different one.`);
          }
  
          // 3. Update the permissions
          const updatedUser = await ctx.prisma.user.update({
            data: {
              email: args.email,
            },
            where: {
              id: args.userId,
            },
          }).catch(handleSubmitErr);
  
          return updatedUser;
        
        }
      })
  
      t.field('addToCart', {
        type: "CartItem",
        nullable: true,
        args: {
          id: stringArg({ nullable: false }),
        },
        resolve: async (root: any, args: any, ctx: any) => {
  
          // 1. Make sure they are signed in
          const { userId } = ctx.req;

          if (!userId) {
            throw new Error('Please register/login to begin purchasing items.');
          }
  
          // 2. Query the users current cart
          const existingCartItem = await ctx.prisma.cartItem.findMany({
            where: {
              user: { equals: userId },
              item: { equals: args.id },
            },
          }).catch(handleSubmitErr);
  
          // 2b. Check that the existingCartItem count is not > the Item quantity available
          const currentItemState = await ctx.prisma.item.findOne({
            where: {
              id: args.id,
            },
          }).catch(handleSubmitErr);
  
          let totalCheck = ((existingCartItem && existingCartItem.quantity + 1) > currentItemState.quantity || 1 > currentItemState.quantity)? true : false;
          if (totalCheck) {
            // return null; // Don't add the item to the cart
            throw new Error(`Only ${currentItemState.quantity} of these items ${currentItemState.quantity === 1 ? 'is' : 'are'} available for purchase.`);
          }
  
          // 3. Check if that item is already in their cart and increment by 1 if it is
          if (existingCartItem) {
            //console.log('This item is already in their cart');
            return ctx.prisma.cartItem.update({
              where: { id: existingCartItem.id },
              data: { quantity: existingCartItem.quantity + 1 },
            }).catch(handleSubmitErr);
          }
  
          // 4. If its not, create a fresh CartItem for that user!
          const newCartItem = await ctx.prisma.cartItem.create({
            data: {
              //id: '-1',
              User: {
                connect: { id: userId },
              },
              Item: {
                connect: { id: args.id },
              },
            },
          }).catch((err: any) => {

            return err;

          });

          console.log("newCartItem = ", newCartItem);
          return newCartItem;

        }
      })
  
      t.field('addItemVariantsToCart', {
        type: "CartItem",
        nullable: true,
        args: {
          id: stringArg({ nullable: false }),
        },
        resolve: async (root: any, args: any, ctx: any) => {
          
          // 1. Make sure they are signed in
          const { userId } = ctx.req;
          
          if (!userId) {
            throw new Error('Please register/login to begin purchasing items.');
          }
  
          // 2. Query the users current cart
          const existingCartItem = await ctx.prisma.cartItem.findMany({
            where: {
              user: { equals: userId },
              itemvariants: { equals: args.id },
            },
          }).catch(handleSubmitErr);

          // 2b. Check that the existingCartItem count is not > the Item quantity available
          const currentItemState = await ctx.prisma.itemVariants.findOne({
            where: {
              id: args.id,
            },
          }).catch(handleSubmitErr);

          let totalCheck = ((existingCartItem && existingCartItem.quantity + 1) > currentItemState.quantity || 1 > currentItemState.quantity)? true : false;

          if (totalCheck === true) {
            // return null; // Don't add the item to the cart
            throw new Error(`Only ${currentItemState.quantity} of these items ${currentItemState.quantity === 1 ? 'is' : 'are'} available for purchase.`);
          }

          // 3. Check if that item is already in their cart and increment by 1 if it is
          if (existingCartItem.length >= 1) {
            
            const updatedCartItem = await ctx.prisma.cartItem.update({
              where: { id: existingCartItem[0].id },
              data: { quantity: existingCartItem[0].quantity + 1 },
            }).catch(handleSubmitErr);

            return updatedCartItem;

          }
  
          // 4. If its not, create a fresh CartItem for that user!
          const newCartItem = await ctx.prisma.cartItem.create({
            data: {
              User: {
                connect: { id: userId },
              },
              ItemVariants: {
                connect: { id: args.id },
              },
              Item: {
                connect: { id: currentItemState.item } // If this throws error try currentItemState.item.id
              }
            },
          }).catch((err: any) => {

            return err;

          });

          return newCartItem;
  
        }
      })
  
      t.field('removeFromCart', {
        type: "CartItem",
        nullable: true,
        args: {
          id: stringArg({ nullable: false }),
          itemId: stringArg({ nullable: false })
        },
        resolve: async (root: any, args: any, ctx: any) => {

          const { userId } = ctx.req;
  
          // 1. Find the cart item
          const cartItem = await ctx.prisma.cartItem.findOne({
            where: {
              id: args.id,
            },
          }).catch(handleSubmitErr);
  
          // 1.5 Make sure we found an item
          if (!cartItem) throw new Error('No CartItem Found!');
  
          // 2. Make sure they own that cart item
          if (cartItem.user !== userId) {
            throw new Error('Cheatin huhhhh');
          }
  
          // 3. Delete that cart item
          return ctx.prisma.cartItem.delete({
            where: { id: args.id },
          }).catch(handleSubmitErr);
        
        }
      })
  
      t.field('createOrder', {
        type: "Order",
        nullable: false,
        args: {
          token: stringArg({ nullable: false }), 
          address_line: stringArg({ nullable: false }), 
          city: stringArg({ nullable: false }), 
          postcode: stringArg({ nullable: false }), 
          country: stringArg({ nullable: false }), 
          card_brand: stringArg({ nullable: false }), 
          last4card_digits: stringArg({ nullable: false }), 
          card_name: stringArg({ nullable: false })
        },
        resolve: async (root: any, args: any, ctx: any) => {
  
          // console.log("createOrder args = ", args);
          // 1. Query the current user and make sure they are signed in
          const { userId } = ctx.req;
  
          if (!userId) throw new Error('You must be signed in to complete this order.');
  
          const user = await ctx.prisma.user.findOne({ 
            where: { id: userId } 
          }).catch(handleSubmitErr);
  
          // 2. recalculate the total for the price
          const amount = user && user.cart.reduce(
            (tally: any, cartItem: any) => tally + cartItem.itemvariants.price * cartItem.quantity,
            0
          );
          // console.log(`Going to charge for a total of ${amount}`);
          // 3. Create the stripe charge (turn token into $$$)
          const charge = await stripe.paymentIntents.create({
            amount,
            currency: 'GBP',
            confirm: true,
            payment_method: args.token,
          })
          .catch((err: any) => {
            // Returning the error like this, instead of doing (handleSubmitErr) 
            // allows the actual stripe error, instead of a generic graphql error message, to be returned
            return err;
          });
  
          // 3b. Check if the charge has failed and generated an error object
          let chargeFailed = false;
          // console.log("charge object = ", charge.raw && charge.raw.code);
  
          if (charge && charge.raw) {
            chargeFailed = true;
          }
  
          // Create a trojan horse createOrder object, which is only being used
          // to return the actual error message (charge.raw.code) to the client
          if (chargeFailed) {
            const errorObj = {
              //id: -1,
              charge: charge.raw.message,
              total: 123,
              //code: charge.raw.code,
              //message: charge.raw.message,
            }
            return errorObj;
          };
          
          // 4. Convert the CartItems to OrderItems and decrement Item quantity by the cartItem.item.quantity
          const orderItems = user && user.cart.map((cartItem: any) => {
            const orderItem = {
              //...cartItem.itemvariants,
              id: cartItem.itemvariants.id,
              user: { connect: { id: userId } },
              itemid: cartItem.itemvariants.id,
              // Pull in the standard product info
              title: cartItem.item.title,
              description: cartItem.item.description,
              mainDescription: cartItem.item.mainDescription,
              // price: cartItem.item.price,
              // Now pull in the item variant info
              price: cartItem.itemvariants.price,
              image: cartItem.itemvariants.image,
              largeImage: cartItem.itemvariants.largeImage,
              quantity: cartItem.quantity,
              color: { connect: { name: cartItem.itemvariants.color.name } },
              size: { connect: { name: cartItem.itemvariants.size.name } }
            };
            
            // Update the quantity sold of each Item variant
            const quantityValItemVariant = cartItem.itemvariants.quantity - cartItem.quantity;
            const updateItemVariantQuantity = ctx.prisma.itemVariants.update({
              data: {
                quantity: quantityValItemVariant,
              },
              where: {
                id: cartItem.itemvariants.id,
              },
            }).catch(handleSubmitErr);
            
            delete orderItem.id;
            return orderItem;
          });
          
          // 5. create the Order
          const order = await ctx.prisma.order.create({
            data: {
              //id: '-1',
              total: charge.amount,
              charge: charge.id,
              card_brand: args.card_brand,
              last4card_digits: args.last4card_digits,
              items: { create: orderItems },
              User: { connect: { id: userId } },
              address_line: args.address_line,
              city: args.city,
              postcode: args.postcode,
              country: args.country,
              card_name: args.card_name,
            },
          }).catch(handleSubmitErr);
  
          //console.log("order = ", order);
  
          // 6. Clean up - clear the users cart, delete cartItems
          const cartItemIds = user && user.cart.map((cartItem: any) => cartItem.id);
          await ctx.prisma.cartItem.deleteMany({
            where: {
              id: {
                in: cartItemIds,
              }
            },
          }).catch(handleSubmitErr);
  
          // 7. Send an email order request and customer receipt. Use the format in 
          // frontend/Order to create the email 
  
          // Order request
          const clientOrder = await transport.sendMail({
            from: user.email,
            to: 'orders@flamingo.com',
            subject: 'Customer Order',
            html: orderRequest(order),
          }).catch(handleSubmitErr);
  
          // Customer receipt
          const customerReceipt = await transport.sendMail({
            from: 'sales@flamingo.com',
            to: user.email,
            subject: 'Your Flamingo Receipt',
            html: mailReceipt(order, orderItems),
          }).catch(handleSubmitErr);
  
          // 8. Return the Order to the client
          return order;
  
        }
      })
  
      t.field('updateCartItem', {
        type: "CartItem",
        nullable: true,
        args: {
          id: stringArg({ nullable: false }),
          quantity: intArg({ nullable: true })
        },
        resolve: async (root: any, args: any, ctx: any) => {
  
          // 1. Check if they are logged in
          const { userId } = ctx.req;
  
          if (!userId) { // !ctx.req.userId
            throw new Error('You must be logged in!');
          }
  
          // first take a copy of the updates
          const updates = { ...args };
  
          // remove the ID from the updates
          delete updates.id;
  
          // run the update method
          return ctx.prisma.cartItem.update({
            data: updates,
            where: {
              id: args.id,
            },
          }).catch(handleSubmitErr);
  
        }
      })
  
    }  
  })
