import React, { FC, memo, useEffect } from 'react';
import styled from 'styled-components';
import ItemComp from './Item';
import { Props } from './interfaceTypes/ItemsListItems'

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  top: ${props => props.theme.top};
  left:0px;
  right:0px;
  bottom:0px;
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    grid-template-columns: 1fr;
  }
`;

//Item list items.
const ItemsListItems: FC<Props> = ({ data, urlReferer, loading, error, subscribeToNewItems }) => {
  useEffect(() => {
    let isSubscribed = true;
    if(isSubscribed) {
      subscribeToNewItems()
    }
    return () => {
      (subscribeToNewItems as any).unsubscribe;
      isSubscribed = false
    };
  },[loading === false]);

  if (error) return <p>Error: {error.message}</p>;
  
  // If for some bizzare reason you have deleted the default items from withdata, this
  // secondary check is required to ensure the page doesn't crash.
  if (!data || (loading && !data.items)) return <p>Loading Items...</p>;
  //if (!data.items) return <p>Loading Items...</p>;

  if (data.items) {
    return (
      <ItemsList>{data.items.map(item =><ItemComp item={item} key={item.id} urlReferer={urlReferer} />)}</ItemsList>
    );
  }
}

export default memo(ItemsListItems);
