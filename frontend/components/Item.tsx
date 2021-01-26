import React, { FC, memo, useEffect } from 'react';
import { gql } from '@apollo/client';
import { graphql, ChildDataProps } from '@apollo/client/react/hoc';
import PropTypes from 'prop-types';
import Image from 'next/image';
import Link from 'next/link';
import update from 'immutability-helper';
import Title from './styles/Title';
import ItemStyles from './styles/ItemStyles';
//import PriceTag from './styles/PriceTag';
import formatMoney from '../lib/formatMoney';
import DeleteItem from './DeleteItem';
import DeleteItemLoggedOut from './DeleteItemLoggedOut';
import AddToCart from './AddToCart';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import { ALL_ITEMS_QUERY } from './Items';
import { useClient } from '../lib/Client';
import { Item, InputProps, Response, Props } from './interfaceTypes/Item'

const DELETE_ITEM_SUBSCRIPTION = gql`
  subscription {
    itemDeleted {
      type
      item {
        id,
        userIdentity
      }
    }
  }
`;

type ChildProps = ChildDataProps<InputProps, Response, {}>

const userQuery = graphql<InputProps, Response, {}, ChildProps>(
  CURRENT_USER_QUERY,
  {
    options: { 
      fetchPolicy: 'cache-and-network',
      pollInterval: 300
    },
  }
);

const querySubscribe = (subscribeToMore, client) => {
  let items: Item;
  let index;

  const isDuplicateItem = (deletedItem, existingItems) => {
    let duplicateItem = -1;

    existingItems.map((item, index) => {
      if (deletedItem.id == item.id) {
        duplicateItem = index;
      }
    });

    return duplicateItem;
  }

  subscribeToMore({
  document: DELETE_ITEM_SUBSCRIPTION,
  updateQuery: (previousResult, { subscriptionData }) => {
    if (!subscriptionData.data) return previousResult;

    console.log("SubscriptionWatch in Item.js = ", subscriptionData.data);
                
    let deletedItem = subscriptionData.data.itemDeleted.item;

    let prevFromCache = client.readQuery({query: ALL_ITEMS_QUERY});

    // Had to put this prevFromCache check because calling client.resetStore() causes prevFromCache
    // to be destroyed, and thus throws an error as a result of the component being re-rendered.
    if (prevFromCache) {
      items = previousResult.me.items.length == 0 ? prevFromCache.items : previousResult.me.items;
      index = isDuplicateItem(deletedItem, items);

      if (index != -1) {
        // Create a new item list minus the one to delete
        if (previousResult.me.items.length == 0) {
          let data = update(prevFromCache, {
            items: { $splice: [[[index] as any, 1]] }
          });
          client.writeQuery({ query: ALL_ITEMS_QUERY, data });
        } else {
          let newList = update(previousResult, {
            me: {
              items: { $splice: [[[index] as any, 1]] }
            }
          });
          //console.log("newList = ", newList);
          // If the item is being deleted from the delete button, then
          // don't resetStore as it will throw errors for the Admin user
          let buttonCheck = deletedItem.item.userIdentity.split("-");

          if (previousResult.me.id != buttonCheck[0]) {
            //client.clearStore();
            client.resetStore();
          }
          return Object.assign({}, previousResult, {
            newList
          });
        }
      } else {
        // Return the existing list as the item to delete is already deleted from the list
        return previousResult;
      }
    }
  },
  });
}

// ItemComp
const ItemComp: FC<Props> = ({ item, urlReferer, data: { me, error, stopPolling, subscribeToMore }}) => {
  const client = useClient();
  stopPolling(600);
  
  //The sum total of variant items available for purchase.
  let quantity = item.itemvariants.reduce((a, variant) => a + variant.quantity, 0);

  useEffect(() => {
    let isSubscribed = true;
    if(isSubscribed) {
      querySubscribe(subscribeToMore, client);
    }
    return () => {
      (querySubscribe as any).unsubscribe;
      isSubscribed = false
    };
  },[urlReferer]);

  if (error) return <Error error={error} page="" />;

  // If (me) determine whether user have admin permissions else hasPerms = false
  let hasPerms;
  hasPerms = (me && me === null) ? false : (me && me.permissions2.some(permission => ['ADMIN'].includes(permission)));

  let imageAddress = item.image.split("https://res.cloudinary.com/theomer/image/upload");

  return (
  <ItemStyles>
    <Link 
      href={{
        pathname: '/item',
        query: { id: item.id }
      }} passHref>
      <a>{item.image && <img src={item.image} alt={item.title} />}</a>
    </Link>
    <Title>
      <Link 
        href={{
          pathname: '/item',
          query: { id: item.id }
        }} passHref>
        <a>{item.title}</a>
      </Link>
    </Title>
    {/* <PriceTag>{formatMoney(item.price)}</PriceTag> */}
    <p>{item.description}</p> <span>{ (quantity <= 10 && quantity !== 0) && `(${quantity} in stock)` }</span>
    <div className="price">{formatMoney(item.price)}</div>
    <div className="buttonList">
      <AddToCart id={item.id} itemDetails={{ ...item }} />
      {hasPerms && (
      <>
      <Link 
        href={{
          pathname: 'update',
          query: { id: item.id }
        }} passHref>
        <a>Edit ✏️</a>
      </Link>
      {/* Make sure to replicate any changes made in DeleteItem in DeleteItemLoggedOut below */}
      <DeleteItem 
        id={item.id}
      >Delete This Item</DeleteItem>
      </>
      )}
      {/* If user is not an Admin */}
      {!hasPerms && (
      <>
      <DeleteItemLoggedOut 
        id={item.id}
        urlReferer={urlReferer}
      />
      </>
      )}
    </div>
  </ItemStyles>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.item === nextProps.item; 
}

/*ItemComp.propTypes = {
  item: PropTypes.object.isRequired,
};*/

export default memo(userQuery(ItemComp), arePropsEqual);
