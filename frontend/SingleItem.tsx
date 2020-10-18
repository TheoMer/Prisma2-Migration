import React, { FC, memo, useState, useEffect } from 'react';
import { gql, useQuery  } from '@apollo/client';
import { useRouter } from 'next/router';
//import ReactImageMagnify from 'react-image-magnify';
import Error from './ErrorMessage';
import styled from 'styled-components';
import Head from 'next/head';
import formatMoney from '../lib/formatMoney';
import AddToCartVariantOrder from './AddToCartVariantOrder';
import IpBrowserDetails from './IpBrowserDetails';
import { useUser } from './User';
import SingleItemCarocel from './SingleItem_Carocel';
import { SingleItemData, SingleItemVars, Props } from './interfaceTypes/SingleItem'

//CSS import is situated in pages/_app.
import '../public/static/SingleItemStyles.css';

const SingleItemStylez = styled.div`
  max-width: 1200px;
  margin: 3rem auto; /* Was formally 2rem */
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr 1fr;
  grid-auto-flow: column;
  min-height: 570px; /* Was formally 800 */
  img {
    width: 100%;
    height: 400px; /* Was formally 100% */
    object-fit: contain;
    pointer-events: none; /* Removes the "save image" context */
  }
  .details {
    margin: 3rem;
    font-size: 1.6rem; /* Was formally 2 */
  }
  .fluid__image-container {
    height: fit-content;
  }
  .cartButton {
    grid-area: 2 / 1 / span 1 / span 2; /* convention = row / col / row / col */
  }
  /* Style for iPhone */
  @media only screen 
  and (min-device-width : 320px) 
  and (max-device-width : 568px) { 
    min-height: 450px;
    .details {
      margin-top: 0px;
      margin-left: 2rem;
      font-family: Arial;
      line-height: 2.5rem;
      font-size: 12px;
      width: 95%;
      height: fit-content;      
    }
  }
`;

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: String!) {
    item(where: { id: $id }) {
      id
      title
      description
      mainDescription
      image
      largeImage
      image2
      largeImage2
      image3
      largeImage3
      image4
      largeImage4
      image5
      largeImage5
      image6
      largeImage6
      quantity
      price
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
      itemvariants {
        id
        price
        image
        largeImage
        image2
        largeImage2
        image3
        largeImage3
        image4
        largeImage4
        image5
        largeImage5
        image6
        largeImage6
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

//SingleItem
const SingleItem:FC<Props> = ({ id: singleItemID, user_ip, user_Agent, url }) => {
  const router = useRouter();

  const [smallImage, setSmallImage] = useState('');
  const [largeImage, setLargeImage] = useState('');

  const [smallImage2, setSmallImage2] = useState('');
  const [largeImage2, setLargeImage2] = useState('');

  const [smallImage3, setSmallImage3] = useState('');
  const [largeImage3, setLargeImage3] = useState('');

  const [smallImage4, setSmallImage4] = useState('');
  const [largeImage4, setLargeImage4] = useState('');

  const [smallImage5, setSmallImage5] = useState('');
  const [largeImage5, setLargeImage5] = useState('');

  const [smallImage6, setSmallImage6] = useState('');
  const [largeImage6, setLargeImage6] = useState('');
  const [cartClick, setCartClick] = useState(false);

  const myCallBack = (smallV, largeV, smallV2, largeV2, smallV3, largeV3, smallV4, largeV4, smallV5, largeV5, smallV6, largeV6) => {
    setSmallImage(smallV === '' ? '' : smallV);
    setLargeImage(largeV === '' ? '' : largeV);

    setSmallImage2(smallV2 === '' ? '' : smallV2);
    setLargeImage2(largeV2 === '' ? '' : largeV2);

    setSmallImage3(smallV3 === '' ? '' : smallV3);
    setLargeImage3(largeV3 === '' ? '' : largeV3);

    setSmallImage4(smallV4 === '' ? '' : smallV4);
    setLargeImage4(largeV4 === '' ? '' : largeV4);

    setSmallImage5(smallV5 === '' ? '' : smallV5);
    setLargeImage5(largeV5 === '' ? '' : largeV5);

    setSmallImage6(smallV6 === '' ? '' : smallV6);
    setLargeImage6(largeV6 === '' ? '' : largeV6);

    setCartClick(false);
  }

  const { id } = router.query;
  //const { user_ip, user_Agent, url, urlReferer } = props; //From pages/index.js

  useEffect(() => {
    setCartClick(true); // 2. The user has clicked a link in the cart, so update the image correctly.
  },[id]); // 1. If the id changes, then do 2.

  // User hook
  const user = useUser();

  // SINGLE ITEM QUERY
  const { data: dataSingleItem, error: erroSingleItem, loading: loadingSingleItem } = useQuery<SingleItemData, SingleItemVars>(
    SINGLE_ITEM_QUERY,
    { 
      variables: {  
        id: singleItemID
      }
    }
  );

  // User hook Variables
  if (!user) return null;
  if (user.error) return <Error error={user.error} page="" />;

  const me = user.data.me;

  // Pull the required item out of cache if it exits
  // This will only work for an admin
  let userItem = me && me.items.filter(item => item.id === singleItemID);

  const userID = me && me.id;
  const userType = (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission))) ? 'GUEST_USER' : 'USER';


  // SINGLE ITEM QUERY Variables
  if (erroSingleItem) return <Error error={erroSingleItem} page="" />;
  if ((!userItem || userItem.length == 0) && (loadingSingleItem && !dataSingleItem.item)) return <p>Loading Item...</p>;
  if (!dataSingleItem.item && (!userItem || userItem.length == 0)) return <p>No Item Found for {singleItemID}</p>;
  
  const item = !userItem || userItem.length == 0 ? dataSingleItem.item : userItem[0];
  
  // The sum total of variant items available for purchase.
  let quantity = item.itemvariants.reduce((a, variant) => a + variant.quantity, 0);

  return (
    <>
    <IpBrowserDetails userID={userID} userType={userType} user_ip={user_ip} user_Agent={user_Agent} url={url} />
    {item && (
        // Initial setting of favicon page title is done in components/Meta.js
        <div className="react-slick">
          <Head>
            <title>Flamingo | {item.title}</title>
          </Head>
          {/* Image magnification */}
          <>
          <div className="fluid__image-container">
            {/*<ReactImageMagnify {...{
                smallImage: {
                    alt: item.title,
                    isFluidWidth: true,
                    src: smallImage === '' || cartClick === true ? item.image : smallImage
                },
                largeImage: {
                    src: largeImage === '' || cartClick === true ? item.largeImage : largeImage,
                    width: 1200,
                    height: 1800
                },
                isHintEnabled: true,
                shouldHideHintAfterFirstActivation: false
            }} />*/}
            <SingleItemCarocel {...{
                rimProps: {
                    isHintEnabled: true,
                    shouldHideHintAfterFirstActivation: false,
                    enlargedImagePosition: 'over'
                },
                item, 
                cartClick, 
                smallImage, 
                largeImage,
                smallImage2, 
                largeImage2,
                smallImage3, 
                largeImage3,
                smallImage4, 
                largeImage4,
                smallImage5, 
                largeImage5,
                smallImage6, 
                largeImage6
            }} />
          </div>
          <div className="details">
            <h2>{item.title}</h2>
            <p>{formatMoney(item.price)} { (quantity <= 10 && quantity !== 0) && `(${quantity} in stock)` }</p> 
            <p>{item.description}</p>
            {item.mainDescription}
          </div>
          <div className="cartButton">
            <AddToCartVariantOrder id={item.id} itemDetails={{ ...item }} callbackFromParent={myCallBack} />
          </div>
          </>
        </div>
      )
    }
    </>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.id === nextProps.id; 
}

export default memo(SingleItem, arePropsEqual);
export { SINGLE_ITEM_QUERY };

