import * as Typegen from 'nexus-plugin-prisma/typegen'
import * as Prisma from '@prisma/client';

// Pagination type
type Pagination = {
  take?: boolean
  skip?: boolean
  cursor?: boolean
}

// Prisma custom scalar names
type CustomScalars = 'DateTime'

// Prisma model type definitions
interface PrismaModels {
  Address: Prisma.Address
  CartItem: Prisma.CartItem
  Color: Prisma.Color
  Item: Prisma.Item
  ItemVariants: Prisma.ItemVariants
  Order: Prisma.Order
  OrderItem: Prisma.OrderItem
  SiteVisits: Prisma.SiteVisits
  Size: Prisma.Size
  User: Prisma.User
}

// Prisma input types metadata
interface NexusPrismaInputs {
  Query: {
    addresses: {
      filtering: 'AND' | 'OR' | 'NOT' | 'address_line' | 'card_name' | 'city' | 'country' | 'createdAt' | 'id' | 'postcode' | 'updatedAt' | 'user' | 'User'
      ordering: 'address_line' | 'card_name' | 'city' | 'country' | 'createdAt' | 'id' | 'postcode' | 'updatedAt' | 'user'
    }
    cartItems: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user' | 'Item' | 'ItemVariants' | 'User'
      ordering: 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user'
    }
    colors: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'id' | 'label' | 'name' | 'updatedAt' | 'item' | 'itemvariants' | 'orderitem'
      ordering: 'createdAt' | 'id' | 'label' | 'name' | 'updatedAt'
    }
    items: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity' | 'Color' | 'Size' | 'User' | 'cartitems' | 'itemvariants'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity'
    }
    itemVariants: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Item' | 'Size' | 'User' | 'cartitems'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
    orders: {
      filtering: 'AND' | 'OR' | 'NOT' | 'address_line' | 'card_brand' | 'card_name' | 'charge' | 'city' | 'country' | 'createdAt' | 'id' | 'last4card_digits' | 'postcode' | 'total' | 'updatedAt' | 'user' | 'User' | 'items'
      ordering: 'address_line' | 'card_brand' | 'card_name' | 'charge' | 'city' | 'country' | 'createdAt' | 'id' | 'last4card_digits' | 'postcode' | 'total' | 'updatedAt' | 'user'
    }
    orderItems: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Order' | 'Size' | 'User'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
    siteVisits: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'id' | 'updatedAt' | 'url' | 'urlReferer' | 'userAgent' | 'userID' | 'userIP' | 'userType'
      ordering: 'createdAt' | 'id' | 'updatedAt' | 'url' | 'urlReferer' | 'userAgent' | 'userID' | 'userIP' | 'userType'
    }
    sizes: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'id' | 'label' | 'name' | 'updatedAt' | 'item' | 'itemvariants' | 'orderitem'
      ordering: 'createdAt' | 'id' | 'label' | 'name' | 'updatedAt'
    }
    users: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'email' | 'id' | 'name' | 'password' | 'permissions2' | 'resetToken' | 'resetTokenExpiry' | 'updatedAt' | 'address' | 'cart' | 'items' | 'itemvariants' | 'order' | 'orderitem'
      ordering: 'createdAt' | 'email' | 'id' | 'name' | 'password' | 'permissions2' | 'resetToken' | 'resetTokenExpiry' | 'updatedAt'
    }
  },
  Address: {

  }
  CartItem: {

  }
  Color: {
    item: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity' | 'Color' | 'Size' | 'User' | 'cartitems' | 'itemvariants'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity'
    }
    itemvariants: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Item' | 'Size' | 'User' | 'cartitems'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
    orderitem: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Order' | 'Size' | 'User'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
  }
  Item: {
    cartitems: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user' | 'Item' | 'ItemVariants' | 'User'
      ordering: 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user'
    }
    itemvariants: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Item' | 'Size' | 'User' | 'cartitems'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
  }
  ItemVariants: {
    cartitems: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user' | 'Item' | 'ItemVariants' | 'User'
      ordering: 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user'
    }
  }
  Order: {
    items: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Order' | 'Size' | 'User'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
  }
  OrderItem: {

  }
  SiteVisits: {

  }
  Size: {
    item: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity' | 'Color' | 'Size' | 'User' | 'cartitems' | 'itemvariants'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity'
    }
    itemvariants: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Item' | 'Size' | 'User' | 'cartitems'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
    orderitem: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Order' | 'Size' | 'User'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
  }
  User: {
    address: {
      filtering: 'AND' | 'OR' | 'NOT' | 'address_line' | 'card_name' | 'city' | 'country' | 'createdAt' | 'id' | 'postcode' | 'updatedAt' | 'user' | 'User'
      ordering: 'address_line' | 'card_name' | 'city' | 'country' | 'createdAt' | 'id' | 'postcode' | 'updatedAt' | 'user'
    }
    cart: {
      filtering: 'AND' | 'OR' | 'NOT' | 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user' | 'Item' | 'ItemVariants' | 'User'
      ordering: 'createdAt' | 'id' | 'item' | 'itemvariants' | 'quantity' | 'updatedAt' | 'user'
    }
    items: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity' | 'Color' | 'Size' | 'User' | 'cartitems' | 'itemvariants'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'userIdentity'
    }
    itemvariants: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Item' | 'Size' | 'User' | 'cartitems'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'image2' | 'image3' | 'image4' | 'image5' | 'image6' | 'item' | 'largeImage' | 'largeImage2' | 'largeImage3' | 'largeImage4' | 'largeImage5' | 'largeImage6' | 'mainDescription' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
    order: {
      filtering: 'AND' | 'OR' | 'NOT' | 'address_line' | 'card_brand' | 'card_name' | 'charge' | 'city' | 'country' | 'createdAt' | 'id' | 'last4card_digits' | 'postcode' | 'total' | 'updatedAt' | 'user' | 'User' | 'items'
      ordering: 'address_line' | 'card_brand' | 'card_name' | 'charge' | 'city' | 'country' | 'createdAt' | 'id' | 'last4card_digits' | 'postcode' | 'total' | 'updatedAt' | 'user'
    }
    orderitem: {
      filtering: 'AND' | 'OR' | 'NOT' | 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user' | 'Color' | 'Order' | 'Size' | 'User'
      ordering: 'color' | 'createdAt' | 'description' | 'id' | 'image' | 'itemid' | 'largeImage' | 'mainDescription' | 'order' | 'price' | 'quantity' | 'size' | 'title' | 'updatedAt' | 'user'
    }
  }
}

// Prisma output types metadata
interface NexusPrismaOutputs {
  Query: {
    address: 'Address'
    addresses: 'Address'
    cartItem: 'CartItem'
    cartItems: 'CartItem'
    color: 'Color'
    colors: 'Color'
    item: 'Item'
    items: 'Item'
    itemVariants: 'ItemVariants'
    itemVariants: 'ItemVariants'
    order: 'Order'
    orders: 'Order'
    orderItem: 'OrderItem'
    orderItems: 'OrderItem'
    siteVisits: 'SiteVisits'
    siteVisits: 'SiteVisits'
    size: 'Size'
    sizes: 'Size'
    user: 'User'
    users: 'User'
  },
  Mutation: {
    createOneAddress: 'Address'
    updateOneAddress: 'Address'
    updateManyAddress: 'BatchPayload'
    deleteOneAddress: 'Address'
    deleteManyAddress: 'BatchPayload'
    upsertOneAddress: 'Address'
    createOneCartItem: 'CartItem'
    updateOneCartItem: 'CartItem'
    updateManyCartItem: 'BatchPayload'
    deleteOneCartItem: 'CartItem'
    deleteManyCartItem: 'BatchPayload'
    upsertOneCartItem: 'CartItem'
    createOneColor: 'Color'
    updateOneColor: 'Color'
    updateManyColor: 'BatchPayload'
    deleteOneColor: 'Color'
    deleteManyColor: 'BatchPayload'
    upsertOneColor: 'Color'
    createOneItem: 'Item'
    updateOneItem: 'Item'
    updateManyItem: 'BatchPayload'
    deleteOneItem: 'Item'
    deleteManyItem: 'BatchPayload'
    upsertOneItem: 'Item'
    createOneItemVariants: 'ItemVariants'
    updateOneItemVariants: 'ItemVariants'
    updateManyItemVariants: 'BatchPayload'
    deleteOneItemVariants: 'ItemVariants'
    deleteManyItemVariants: 'BatchPayload'
    upsertOneItemVariants: 'ItemVariants'
    createOneOrder: 'Order'
    updateOneOrder: 'Order'
    updateManyOrder: 'BatchPayload'
    deleteOneOrder: 'Order'
    deleteManyOrder: 'BatchPayload'
    upsertOneOrder: 'Order'
    createOneOrderItem: 'OrderItem'
    updateOneOrderItem: 'OrderItem'
    updateManyOrderItem: 'BatchPayload'
    deleteOneOrderItem: 'OrderItem'
    deleteManyOrderItem: 'BatchPayload'
    upsertOneOrderItem: 'OrderItem'
    createOneSiteVisits: 'SiteVisits'
    updateOneSiteVisits: 'SiteVisits'
    updateManySiteVisits: 'BatchPayload'
    deleteOneSiteVisits: 'SiteVisits'
    deleteManySiteVisits: 'BatchPayload'
    upsertOneSiteVisits: 'SiteVisits'
    createOneSize: 'Size'
    updateOneSize: 'Size'
    updateManySize: 'BatchPayload'
    deleteOneSize: 'Size'
    deleteManySize: 'BatchPayload'
    upsertOneSize: 'Size'
    createOneUser: 'User'
    updateOneUser: 'User'
    updateManyUser: 'BatchPayload'
    deleteOneUser: 'User'
    deleteManyUser: 'BatchPayload'
    upsertOneUser: 'User'
  },
  Address: {
    address_line: 'String'
    card_name: 'String'
    city: 'String'
    country: 'String'
    createdAt: 'DateTime'
    id: 'String'
    postcode: 'String'
    updatedAt: 'DateTime'
    user: 'String'
    User: 'User'
  }
  CartItem: {
    createdAt: 'DateTime'
    id: 'String'
    item: 'String'
    itemvariants: 'String'
    quantity: 'Int'
    updatedAt: 'DateTime'
    user: 'String'
    Item: 'Item'
    ItemVariants: 'ItemVariants'
    User: 'User'
  }
  Color: {
    createdAt: 'DateTime'
    id: 'String'
    label: 'String'
    name: 'String'
    updatedAt: 'DateTime'
    item: 'Item'
    itemvariants: 'ItemVariants'
    orderitem: 'OrderItem'
  }
  Item: {
    color: 'String'
    createdAt: 'DateTime'
    description: 'String'
    id: 'String'
    image: 'String'
    image2: 'String'
    image3: 'String'
    image4: 'String'
    image5: 'String'
    image6: 'String'
    largeImage: 'String'
    largeImage2: 'String'
    largeImage3: 'String'
    largeImage4: 'String'
    largeImage5: 'String'
    largeImage6: 'String'
    mainDescription: 'String'
    price: 'Int'
    quantity: 'Int'
    size: 'String'
    title: 'String'
    updatedAt: 'DateTime'
    user: 'String'
    userIdentity: 'String'
    Color: 'Color'
    Size: 'Size'
    User: 'User'
    cartitems: 'CartItem'
    itemvariants: 'ItemVariants'
  }
  ItemVariants: {
    color: 'String'
    createdAt: 'DateTime'
    description: 'String'
    id: 'String'
    image: 'String'
    image2: 'String'
    image3: 'String'
    image4: 'String'
    image5: 'String'
    image6: 'String'
    item: 'String'
    largeImage: 'String'
    largeImage2: 'String'
    largeImage3: 'String'
    largeImage4: 'String'
    largeImage5: 'String'
    largeImage6: 'String'
    mainDescription: 'String'
    price: 'Int'
    quantity: 'Int'
    size: 'String'
    title: 'String'
    updatedAt: 'DateTime'
    user: 'String'
    Color: 'Color'
    Item: 'Item'
    Size: 'Size'
    User: 'User'
    cartitems: 'CartItem'
  }
  Order: {
    address_line: 'String'
    card_brand: 'String'
    card_name: 'String'
    charge: 'String'
    city: 'String'
    country: 'String'
    createdAt: 'DateTime'
    id: 'String'
    last4card_digits: 'String'
    postcode: 'String'
    total: 'Int'
    updatedAt: 'DateTime'
    user: 'String'
    User: 'User'
    items: 'OrderItem'
  }
  OrderItem: {
    color: 'String'
    createdAt: 'DateTime'
    description: 'String'
    id: 'String'
    image: 'String'
    itemid: 'String'
    largeImage: 'String'
    mainDescription: 'String'
    order: 'String'
    price: 'Int'
    quantity: 'Int'
    size: 'String'
    title: 'String'
    updatedAt: 'DateTime'
    user: 'String'
    Color: 'Color'
    Order: 'Order'
    Size: 'Size'
    User: 'User'
  }
  SiteVisits: {
    createdAt: 'DateTime'
    id: 'String'
    updatedAt: 'DateTime'
    url: 'String'
    urlReferer: 'String'
    userAgent: 'String'
    userID: 'String'
    userIP: 'String'
    userType: 'String'
  }
  Size: {
    createdAt: 'DateTime'
    id: 'String'
    label: 'String'
    name: 'String'
    updatedAt: 'DateTime'
    item: 'Item'
    itemvariants: 'ItemVariants'
    orderitem: 'OrderItem'
  }
  User: {
    createdAt: 'DateTime'
    email: 'String'
    id: 'String'
    name: 'String'
    password: 'String'
    permissions2: 'Permission2'
    resetToken: 'String'
    resetTokenExpiry: 'Float'
    updatedAt: 'DateTime'
    address: 'Address'
    cart: 'CartItem'
    items: 'Item'
    itemvariants: 'ItemVariants'
    order: 'Order'
    orderitem: 'OrderItem'
  }
}

// Helper to gather all methods relative to a model
interface NexusPrismaMethods {
  Address: Typegen.NexusPrismaFields<'Address'>
  CartItem: Typegen.NexusPrismaFields<'CartItem'>
  Color: Typegen.NexusPrismaFields<'Color'>
  Item: Typegen.NexusPrismaFields<'Item'>
  ItemVariants: Typegen.NexusPrismaFields<'ItemVariants'>
  Order: Typegen.NexusPrismaFields<'Order'>
  OrderItem: Typegen.NexusPrismaFields<'OrderItem'>
  SiteVisits: Typegen.NexusPrismaFields<'SiteVisits'>
  Size: Typegen.NexusPrismaFields<'Size'>
  User: Typegen.NexusPrismaFields<'User'>
  Query: Typegen.NexusPrismaFields<'Query'>
  Mutation: Typegen.NexusPrismaFields<'Mutation'>
}

interface NexusPrismaGenTypes {
  inputs: NexusPrismaInputs
  outputs: NexusPrismaOutputs
  methods: NexusPrismaMethods
  models: PrismaModels
  pagination: Pagination
  scalars: CustomScalars
}

declare global {
  interface NexusPrismaGen extends NexusPrismaGenTypes {}

  type NexusPrisma<
    TypeName extends string,
    ModelOrCrud extends 'model' | 'crud'
  > = Typegen.GetNexusPrisma<TypeName, ModelOrCrud>;
}
  