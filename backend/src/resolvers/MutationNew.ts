// export {};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail, orderRequest, mailReceipt } = require('../mail');
const { hasPermission: hasPermissionsOther } = require('../utils');
const stripe = require('../stripe');
const cloudinary = require('cloudinary');
const uuidv3 = require('uuid/v3');

const handleSubmitErr = (err: any) => {
  console.error(err.message);
}

const Mutations = {
  async createItem(parent: any, args: any, ctx: any, info: object) {
    if (!ctx.req.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const item = await ctx.prisma.mutation.createItem(
      {
        data: {
          //This is how to create a relationship between the Item and the User
          user: {
            connect: {
              id: ctx.req.userId,
            },
          },
          ...args,
        },
      },
      info
    ).catch(handleSubmitErr);

    // pubSub subscription
    ctx.pubsub.publish("NEW_ITEM", item);
    return item;
  },
  async createAddress(parent: any, args: any, ctx: any, info: object) {
    // 1. check that uiser is logged in
    if (!ctx.req.userId) {
      throw new Error('You must be logged in to do that!');
    }

    // 2. check that a different user with that email does not exist
    const users = await ctx.prisma.query.users(
      {
        where: {
          email: args.email,
          AND: {
            id_not: args.userId,
          }
        }
      },
    ).catch(handleSubmitErr);

    // I'm having to check the users.length as am [Object: null prototype] is returned
    // See: https://stackoverflow.com/questions/53983315/is-there-a-way-to-get-rid-of-object-null-prototype-in-graphql

    if (users.length >= 1) {
      throw new Error(`A user with this email currently exists. Please select a different one.`);
    }

    // 3. Update the permissions
    const updatedUser = await ctx.prisma.mutation.updateUser(
      {
        data: {
          email: args.email,
          name: args.card_name,
        },
        where: {
          id: args.userId,
        },
      },
      info
    ).catch(handleSubmitErr);

    //return updatedUser;

    // 4. create an address for the user

    // remove the id and email from args
    delete args.userId;
    delete args.email;

    const address = await ctx.prisma.mutation.createAddress(
      {
        data: {
          //This is how to create a relationship between the Address and the User
          user: {
            connect: {
              id: ctx.req.userId,
            },
          },
          ...args,
        },
      },
      info
    ).catch(handleSubmitErr);

    // add the email to the return object
    //address.push(email: args.email);

    return address;
  },
  async updateAddress(parent: any, args: any, ctx: any, info: object) {

    // Update the user details
    const updatedUserEmail = await ctx.prisma.mutation.updateUser(
      {
        data: {
          email: args.email,
          name: args.card_name,
        },
        where: {
          id: ctx.req.userId, //args.userId,
        },
      },
      info
    ).catch(handleSubmitErr);

    // remove the id and email from args
    let addressID = args.userId;
    delete args.userId;
    delete args.email;

    // run the update method
    return ctx.prisma.mutation.updateAddress(
      {
        data: {...args},
        where: {
          id: addressID,
        },
      },
      info
    ).catch(handleSubmitErr);
  },
  async createSiteVisits(parent: any, args: any, ctx: any, info: object) {
    const item = await ctx.prisma.mutation.createSiteVisits(
      {
        data: {
          ...args,
        },
      },
      info
    ).catch(handleSubmitErr);

    return item;
  },
  updateItem(parent: any, args: any, ctx: any, info: object) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    const item = ctx.prisma.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    ).catch(handleSubmitErr);

    // pubSub subscription
    ctx.pubsub.publish("UPDATE_ITEM", item);
    return item;
  },
  async deleteItem(parent: any, args: any, ctx: any, info: object) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.prisma.query.item({ where }, `{ id title image largeImage user { id }}`);
    // 2. Check if they own that item, or have the permissions
    const ownsItem = item.user.id === ctx.req.userId;
    const hasPermissions = ctx.req.user.permissions.some((permission: any) =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );

    if (!ownsItem && !hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }

    // 3a. Update the userIdentity to reflect the user and that a button was clicked
    const userIdentity = await ctx.prisma.mutation.updateItem(
      {
        data: {
          userIdentity: `${ctx.req.userId}-button`
        },
        where: {
          id: args.id,
        },
      },
      info
    ).catch(handleSubmitErr);

    // 3b. Delete it!
    const deletedItem = await ctx.prisma.mutation.deleteItem({ where }, info).catch(handleSubmitErr);

    // 4. If the item was deleted from db, delete image from Cloudinary
    if (deletedItem) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      const file = item.image.substr(60).replace('.jpg', '');
      const deleteImage = await cloudinary.uploader.destroy(file).catch(handleSubmitErr);
    }

    // pubSub subscription
    ctx.pubsub.publish("UPDATE_ITEM", deletedItem);
    return deletedItem;
  },
  async signup(parent: any, args: any, ctx: any, info: object) {
    let user;
    //Chck that the email and password aren't empty
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
    // If userId already exists and the user has guest_user permissions then
    // update the existing user details with the new user details
    const hasPermissions = ctx.req.user.permissions.some((permission: any) =>
      ['GUEST_USER'].includes(permission));
    if (ctx.req.userId && hasPermissions) {
      // Update the permissions
      user = ctx.prisma.mutation.updateUser(
        {
          data: {
            ...args,
            password,
            permissions: {
              set: ['USER'],
            },
          },
          where: {
            id: ctx.req.userId,
          },
        },
        info
      ).catch(handleSubmitErr);
    } else {
      // Check if a user with this email email already exists
      const emailTest = args.email;
      const userTest = await ctx.prisma.query.user(
        {
          where: { emailTest },
        },
      ).catch(handleSubmitErr);
      if (userTest) {
        throw new Error(`A user with the email: ${emailTest} already exists.`);
      }

      // create the user in the database
      user = await ctx.prisma.mutation.createUser(
        {
          data: {
            ...args,
            password,
            permissions: { set: ['USER'] },
          },
        },
        info
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
  },
  async signin(parent: any, { email, password }: {email: any, password: any}, ctx: any, info: object) {
    let user: any;
    //Chck that the email and password aren't empty
    if (email.length == 0) {
      throw new Error('A valid email address is required.');
    }
    if (password.length == 0) {
      throw new Error('A valid password is required.');
    }

    // get cart information for the current user
    const cart = await ctx.prisma.query.cartItems({
      where: {
        user: { id: ctx.req.userId },
      },
    },
    `{ user { id }, quantity, item { id }, itemvariants { id }}`
    ).catch(handleSubmitErr);

    
    // Get user's permission rights
    const hasPermissions = ctx.req.user.permissions.some((permission: any) => ['GUEST_USER'].includes(permission));
    
    // 1. check if there is a user with that email
    user = await ctx.prisma.query.user(
      {
        where: { email },
      },
      `{ id, name, email, password, address { id },  resetToken, resetTokenExpiry}`
    ).catch(handleSubmitErr);

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }

    // 3. Copy guest_user cart if they have items in it
    if (ctx.req.userId && hasPermissions && cart.length >= 1) {
      let cartItemz = {};
      for(let i = 0; i < cart.length; i++){ //used for() instead of map() which didn't allow for await
        let [registered_userCart] = await ctx.prisma.query.cartItems(
          {
            where: {
              user: { id: user.id },
              itemvariants: { id: cart[i].itemvariants.id },
            },
          },
          `{ id, quantity }`
        ).catch(handleSubmitErr);

        // Check whether the guest_user cart item exists in the registered User's cart
        if (registered_userCart) {
          // Update the User cart item quantity
          ctx.prisma.mutation.updateCartItem(
            {
              where: { id: registered_userCart.id },
              data: { quantity: registered_userCart.quantity + cart[i].quantity },
            },
            info
          ).catch(handleSubmitErr);
        }else{
          // Write the guest_user item to the User's cart
          cartItemz = {
            user: {
              connect: { id: user.id }
            },
            quantity: cart[i].quantity,
            itemvariants: {
              connect: { id: cart[i].itemvariants.id},
            },
            item: {
              connect: { id: cart[i].item.id},
            },
          };

          ctx.prisma.mutation.createCartItem(
            {
              data: cartItemz
            },
            info
          ).catch(handleSubmitErr);
        }
      };
    }

    // 4. Transfer a guest_users's orders to the registered user logging in
    // if any exists
    const userOrders = await ctx.prisma.query.orders(
      {
        where: {
          user: { id: ctx.req.userId },
        },
      },
      `
      {
        id,
        items { id, title, description, mainDescription, image, largeImage, price, quantity, user { id }, itemid, size { name }, color { name } },
        total,
        user { id },
        charge,
        address_line,
        city,
        postcode,
        country,
        card_brand,
        last4card_digits,
        card_name
      }
      `
    ).catch(handleSubmitErr);
    
    // A JSON.parse is used otherwise the object returned rads as [Object: null prototype]
    // See: https://stackoverflow.com/questions/53983315/is-there-a-way-to-get-rid-of-object-null-prototype-in-graphql
    const userOrdersProcessed = JSON.parse(JSON.stringify(userOrders));
    
    if (ctx.req.userId && hasPermissions && userOrders.length >= 1) {
      for(let i = 0; i < userOrders.length; i++) {
        const orderItems = userOrdersProcessed[i].items.map((orderItemFromOrder: any) => {
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
        ctx.prisma.mutation.createOrder({
          data: {   
            total: userOrdersProcessed[i].total,
            charge: userOrdersProcessed[i].charge,
            card_brand: userOrdersProcessed[i].card_brand,
            last4card_digits: userOrdersProcessed[i].last4card_digits,
            items: { create: orderItems },
            user: { connect: { id: user.id } },
            address_line: userOrdersProcessed[i].address_line,
            city: userOrdersProcessed[i].city,
            postcode: userOrdersProcessed[i].postcode,
            country: userOrdersProcessed[i].country,
            card_name: userOrdersProcessed[i].card_name,
          },
        },
        info
        ).catch(handleSubmitErr);
      }
    }

    // 5. Transfer user address only if an address for the user doesn't already exist
    if (user.address.length === 0) {
      const userAddress = await ctx.prisma.query.addresses(
        {
          where: {
            user: { 
              id: ctx.req.userId
            },
          },
        },
        `
        {
          id,
          address_line,
          city,
          postcode,
          country,
          card_name,
        }
        `
      ).catch(handleSubmitErr);
  
      // A JSON.parse is used otherwise the object returned rads as [Object: null prototype]
      // See: https://stackoverflow.com/questions/53983315/is-there-a-way-to-get-rid-of-object-null-prototype-in-graphql
      let userAddressProcessed = JSON.parse(JSON.stringify(userAddress));
  
      // create new address object
      if (ctx.req.userId && hasPermissions && userAddress.length >= 1) {
        ctx.prisma.mutation.createAddress({
          data: {   
            user: { connect: { id: user.id } },
            address_line: userAddressProcessed[0].address_line,
            city: userAddressProcessed[0].city,
            postcode: userAddressProcessed[0].postcode,
            country: userAddressProcessed[0].country,
            card_name: userAddressProcessed[0].card_name,
          },
        },
        info
        ).catch(handleSubmitErr);
      }
    }

    // 5. Delete guest_user
    if (ctx.req.userId && hasPermissions) {
      await ctx.prisma.mutation.deleteUser(
        {
          where: { id: ctx.req.userId },
        },
        info
      ).catch(handleSubmitErr);
      // Delete existing gues_user cookie
      await ctx.res.clearCookie('token', { domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN });
    }

    // 6. generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 7. Set the cookie with the token
    ctx.res.cookie('token', token, {
      //Set domain to custom domain name to resolve issue with non custom heroku/now domain names
      domain: process.env.NODE_ENV === 'development' ? process.env.LOCAL_DOMAIN : process.env.APP_DOMAIN,
      secure: process.env.NODE_ENV === 'development' ? false : true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });

    // 8. Return the user
    return user;
  },
  async signout(parent: any, args: any, ctx: any, info: object) {
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
  },
  async requestReset(parent: any, args: any, ctx: any, info: object) {
    //Chck that the email isn't empty
    if (args.email.length == 0) {
      throw new Error('A valid email address is required.');
    }
    // 1. Check if this is a real user
    const user = await ctx.prisma.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }

    // 2. Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.prisma.mutation.updateUser({
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
  },
  async resetPassword(parent: any, args: any, ctx: any, info: object) {
    // 1. check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Your Passwords don't match!");
    }
    // 2. check if its a legit reset token
    // 3. Check if its expired
    const [user] = await ctx.prisma.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    }).catch(handleSubmitErr);
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.prisma.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    }).catch(handleSubmitErr);
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
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
  },
  async updatePermissions(parent: any, args: any, ctx: any, info: object) {
    // 1. Check if they are logged in
    if (!ctx.req.userId) {
      throw new Error('You must be logged in!');
    }
    // 2. Query the current user
    const currentUser = await ctx.prisma.query.user(
      {
        where: {
          id: ctx.req.userId,
        },
      },
      info
    ).catch(handleSubmitErr);
    // 3. Check if they have permissions to do this
    hasPermissionsOther(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4. Update the permissions
    return ctx.prisma.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info
    ).catch(handleSubmitErr);
  },
  async updateGuestEmail(parent: any, args: any, ctx: any, info: object) {
    //Chck that the email and password aren't empty
    if (args.email.length == 0) {
      throw new Error('A valid email address is required.');
    }
    // 1. Check if they are logged in 
    if (!ctx.req.userId) {
      throw new Error('You must be logged in!');
    }
    // 2. check that a different user with that email does not exist
    const users = await ctx.prisma.query.users(
      {
        where: {
          email: args.email,
          AND: {
            id_not: args.userId,
          }
        }
      },
    ).catch(handleSubmitErr);

    // I'm having to check the users.length as am [Object: null prototype] is returned
    // See: https://stackoverflow.com/questions/53983315/is-there-a-way-to-get-rid-of-object-null-prototype-in-graphql

    if (users.length >= 1) {
      throw new Error(`A user with this email currently exists. Please select a different one.`);
    }
    // 3. Update the permissions
    const updatedUser = await ctx.prisma.mutation.updateUser(
      {
        data: {
          email: args.email,
        },
        where: {
          id: args.userId,
        },
      },
      info
    ).catch(handleSubmitErr);

    return updatedUser;
  },
  async addToCart(parent: any, args: any, ctx: any, info: object) {
    // 1. Make sure they are signed in
    const { userId } = ctx.req;
    if (!userId) {
      throw new Error('Please register/login to begin purchasing items.');
    }
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.prisma.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    }).catch(handleSubmitErr);
    // 2b. Check that the existingCartItem count is not > the Item quantity available
    const currentItemState = await ctx.prisma.query.item(
      {
        where: {
          id: args.id,
        },
      },
      `{
        title 
        price 
        id 
        description 
        mainDescription 
        image 
        largeImage 
        quantity 
        color {
          name
          label
        }
        size {
          name
          label
        }
        itemvariants {
          id
          price
          image
          largeImage
          title
          description
          mainDescription
          quantity
          color {
            name
            label
          }
          size {
            name
            label
          }
          item {
            id
          }
        }
      }`
    ).catch(handleSubmitErr);
    let totalCheck = ((existingCartItem && existingCartItem.quantity + 1) >  currentItemState.quantity || 1 > currentItemState.quantity)? true : false;
    if (totalCheck) {
      // return null; // Don't add the item to the cart
      throw new Error(`Only ${currentItemState.quantity} of these items ${currentItemState.quantity === 1 ? 'is' : 'are'} available for purchase.`);
    }
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      //console.log('This item is already in their cart');
      return ctx.prisma.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      ).catch(handleSubmitErr);
    }
    // 4. If its not, create a fresh CartItem for that user!
    return ctx.prisma.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info
    ).catch(handleSubmitErr);
  },
  async addItemVariantsToCart(parent: any, args: any, ctx: any, info: object) {
    // 1. Make sure they are signed in
    const { userId } = ctx.req;
    if (!userId) {
      throw new Error('Please register/login to begin purchasing items.');
    }
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.prisma.query.cartItems({
      where: {
        user: { id: userId },
        itemvariants: { id: args.id },
      },
    }).catch(handleSubmitErr);
    // 2b. Check that the existingCartItem count is not > the Item quantity available
    const currentItemState = await ctx.prisma.query.itemVariants(
      {
        where: {
          id: args.id,
        },
      },
      `{
        title 
        price 
        id 
        description 
        mainDescription 
        image 
        largeImage 
        quantity 
        color {
          name
          label
        }
        size {
          name
          label
        }
        item {
          id
        }
      }`
    ).catch(handleSubmitErr);
    let totalCheck = ((existingCartItem && existingCartItem.quantity + 1) >  currentItemState.quantity || 1 > currentItemState.quantity)? true : false;
    if (totalCheck) {
      //return null; // Don't add the item to the cart
      throw new Error(`Only ${currentItemState.quantity} of these items ${currentItemState.quantity === 1 ? 'is' : 'are'} available for purchase.`);
    }
    // 3. Check if that item is already in their cart and increment by 1 if it is
    if (existingCartItem) {
      //console.log('This item is already in their cart');
      return ctx.prisma.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      ).catch(handleSubmitErr);
    }
    // 4. If its not, create a fresh CartItem for that user!
    return ctx.prisma.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          itemvariants: {
            connect: { id: args.id },
          },
          item: {
            connect: { id: currentItemState.item.id }
          }
        },
      },
      info
    ).catch(handleSubmitErr);
  },
  async removeFromCart(parent: any, args: any, ctx: any, info: object) {
    // 1. Find the cart item
    const cartItem = await ctx.prisma.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{ id, user { id }}`
    ).catch(handleSubmitErr);
    // 1.5 Make sure we found an item
    if (!cartItem) throw new Error('No CartItem Found!');
    // 2. Make sure they own that cart item
    if (cartItem.user.id !== ctx.req.userId) {
      throw new Error('Cheatin huhhhh');
    }
    // 3. Delete that cart item
    return ctx.prisma.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    ).catch(handleSubmitErr);
  },
  async createOrder(parent: any, args: any, ctx: any, info: object) {
    // console.log("createOrder args = ", args);
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.req;
    if (!userId) throw new Error('You must be signed in to complete this order.');
    const user = await ctx.prisma.query.user(
      { where: { id: userId } },
      `{
      id
      name
      email
      cart {
        id
        quantity
        itemvariants {
          id
          price
          image
          largeImage
          title
          description
          mainDescription
          quantity
          color {
            name
            label
          }
          size {
            name
            label
          }
          item {
            id
          }
        }
        item {
          id
          price
          image
          largeImage
          title
          description
          mainDescription
          quantity
          color {
            name
            label
          }
          size {
            name
            label
          }
          itemvariants {
            id
            price
            image
            largeImage
            title
            description
            mainDescription
            quantity
            color {
              name
              label
            }
            size {
              name
              label
            }
            item {
              id
            }
          }
        }
      }}`
    ).catch(handleSubmitErr);
    // 2. recalculate the total for the price
    const amount = user.cart.reduce(
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
      // allows the actual stripe error, instead of a generic grapgql error message, to be returned
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
        id: -1,
        charge: charge.raw.message,
        total: 123,
        //code: charge.raw.code,
        //message: charge.raw.message,
      }
      return errorObj;
    };
    
    // 4. Convert the CartItems to OrderItems and decrement Item quantity by the cartItem.item.quantity
    const orderItems = user.cart.map((cartItem: any) => {
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
      const updateItemVariantQuantity = ctx.prisma.mutation.updateItemVariants({
        data: {
          quantity: quantityValItemVariant,
        },
        where: {
          id: cartItem.itemvariants.id,
        },
      },
      info
      ).catch(handleSubmitErr);
      
      delete orderItem.id;
      return orderItem;
    });
    
    // 5. create the Order
    const order = await ctx.prisma.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        card_brand: args.card_brand,
        last4card_digits: args.last4card_digits,
        items: { create: orderItems },
        user: { connect: { id: userId } },
        address_line: args.address_line,
        city: args.city,
        postcode: args.postcode,
        country: args.country,
        card_name: args.card_name,
      },
    },
    `
    {
      id
      charge
      total
      card_brand
      last4card_digits
      card_name
      createdAt
      address_line
      city
      postcode
      country
      user {
        name
      }
      items {
        id
        title 
        price 
        itemid 
        description 
        mainDescription 
        image 
        largeImage 
        quantity
        color {
          name
          label
        }
        size {
          name
          label
        }        
      }
    }
    `
    ).catch(handleSubmitErr);

    //console.log("order = ", order);

    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map((cartItem: any) => cartItem.id);
    await ctx.prisma.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
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
    // pubSub subscription
    //ctx.pubsub.publish("NEW_ORDER", order);
    let data = {
      data: {
        //order: {
          MUTATION: 'CREATED',
          total: charge.amount,
          charge: charge.id,
          card_brand: args.card_brand,
          last4card_digits: args.last4card_digits,
          items: { create: orderItems },
          user: { connect: { id: userId } },
          address_line: args.address_line,
          city: args.city,
          postcode: args.postcode,
          country: args.country,
          card_name: args.card_name,
        //}
      },     
    };
    ctx.pubsub.publish("order", {
      order: {
        mutation: "CREATED",
        data: data
      }
    });
    return order;
  },
  async updateCartItem(parent: any, args: any, ctx: any, info: object) {
    // 1. Check if they are logged in
    if (!ctx.req.userId) {
      throw new Error('You must be logged in!');
    }
    // first take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.prisma.mutation.updateCartItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    ).catch(handleSubmitErr);
  },
};

module.exports = Mutations;

