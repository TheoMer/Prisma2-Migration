import React, { FC, memo, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import styled from 'styled-components';
import Pagination from './Pagination';
import { perPage } from '../config';
// import { useCart } from './LocalState';
import IpBrowserDetails from './IpBrowserDetails';
import { useUser } from './User';
import ItemsListItems from './ItemsListItems';
import { useClient } from '../lib/Client';
import Error from './ErrorMessage';
import { LocalItemData, Props, AllItemsData, AllItemsVars } from './interfaceTypes/Items'

// Taken from: https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/pagination#do-i-always-have-to-skip-1
// Do I always have to skip: 1?
// If you do not skip: 1, your result set will include your previous cursor
// So in my case perPage gets 6 records and the first query returns four results and the cursor is 29:
// Without skip: 1, the second query returns 6 results after (and including) the cursor
// So page 1 would be 24, 25, 26, 27, 28, 29 and the second page would start 29, 30, 31, 32, 33, 34
// In other words, the last item displayed on page 1 would be the first item displayed on page 2

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $take: Int = ${perPage}) {
    items(
      take: $take, 
      skip: $skip, 
      orderBy: {
        createdAt: desc
      }
    ){
      id
      title
      price
      description
      mainDescription
      image
      largeImage
      quantity
      Color {
        id
        name
        label
      }
      Size {
        id
        name
        label
      }
      User {
        id
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
        Color {
          id
          name
          label
        }
        Size {
          id
          name
          label
        }
        item
      }
    }
  }
`;

const ALL_ITEMS_SUBSCRIPTION = gql`
  subscription {
    itemWatch {
      type
      item {
        id
        title
        price
        description
        mainDescription
        image
        largeImage
        quantity
        Color {
          id
          name
          label
        }
        Size {
          id
          name
          label
        }
        User {
          id
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
          Color {
            id
            name
            label
          }
          Size {
            id
            name
            label
          }
          item
        }
      }        
    }
  }
`;

const LOCAL_STATE_QUERY = gql`
  query {
    items @client {
      id
      Color {
        id
        label
        name
      }
      description
      mainDescription
      image
      largeImage
      itemvariants {
        id
      }
      price
      quantity
      Size {
        id
        label
        name
      }
      title
      User {
        id
      }
    }
  }
`;

const Center = styled.div`
  text-align: center;
  top: ${props => props.theme.top};
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    grid-template-columns: 1fr;
  }
`;

//Items.
const Items: FC<Props> = ({ page, user_ip, user_Agent, url, urlReferer }) => {
 // const ScrollToComp = el => el && el.scrollTo(0, 190);

  // LocalState Query
  const { data: cachedItem, error: errorQuery, loading: loadingQuery } = useQuery<LocalItemData, {}>(
    LOCAL_STATE_QUERY,
  );

  // User hook
  const user = useUser();

  // ALL Items Query
  const { subscribeToMore, ...result } = useQuery<AllItemsData, AllItemsVars>(
    ALL_ITEMS_QUERY,
    { 
      variables: {  
        skip: page * perPage - perPage, 
      } 
    }
  );

  // LocalState Query Variables
  if (errorQuery) return <Error error={errorQuery} page="" />;

  // User hook variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} page="" />;

  const me = user.data.me;
  let userID = me && me.id;
  let userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';

  // ALL Items Query Variables
  if (result.error) return <span>Error: {result.error.message}</span>;

  let meCheck = me === undefined ? cachedItem : me;
  let data1 = !result.data || (result.loading && !result.data.items) ? cachedItem as any : result.data
  //let data1 = result.loading ? cachedItem as any : result.data;

  useEffect(() => {
    console.log("Items loaded....")
  },[urlReferer]); //[urlReferer || !result.loading]);

  return (
    <>
    <IpBrowserDetails userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} />
    <Center>
      <div /*ref={ScrollToComp}*/></div>
      {/* 
          This span text here prevents the visible hop from happening when 
          the items are loaded first from withData then the database 
          on initial page load.
          Info about css prop taken from here: https://styled-components.com/docs/api#css-prop
      */}
      <span
        css={`
          opacity: 0;
        `}
      >Holding text</span>
      <Pagination page={page} />

      {/* 
          Make sure, as a minimum, that the cached items from withData.tsx have loaded first 
          before displaying the items 
      */}
      {!loadingQuery && (
        <ItemsListItems
          //networkStatus={result.networkStatus}
          loading={result.loading}
          error={result.error}
          data={data1}
          urlReferer={urlReferer}
          //page={props.page}
          subscribeToNewItems={() =>
            subscribeToMore({
              document: ALL_ITEMS_SUBSCRIPTION,
              variables: {},
              updateQuery: (prev, { subscriptionData }) => {
                //console.log("SubscriptionWatch in Items.js = ", subscriptionData.data);
                if (!subscriptionData.data) return prev;

                const newItem = subscriptionData.data.itemWatch.item; //subscriptionData.data.item.node;
                const mutationType = subscriptionData.data.itemWatch.type;
                //console.log("mutationType = ", mutationType);

                // Check that the item doesn't already exist in the store
                //console.log("newItem in components/Items.js = ", newItem);
                if (prev.items.find((item) => item.id === newItem.id)) {
                  return prev;                    
                }

                if (mutationType === 'CREATED') {
                  return Object.assign({}, prev, {
                    items: [newItem, ...prev.items]
                  });
                }
              }
            })
          }
        />        
      )}
      <Pagination page={page} />
    </Center>
    </>
  );
}

export default memo(Items);
export { ALL_ITEMS_QUERY };

