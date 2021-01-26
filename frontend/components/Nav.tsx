import React, { memo } from 'react';
import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import { useUser } from './User';
import CartCount from './CartCount';
import Signout from './Signout';
import { useCart } from './LocalState';

const Nav = props => {

  const { toggleCart } = useCart();

  // User hook
  const user = useUser();
  if (!user) return null;

  const me = user.data.me;
  
  // If (me) determine whether user have admin permissions else hasPerms = false
  const { client } = props;
  let hasAdminPerms;
  let hasPerms;
  let hasGuestPerms;
  let hasGuestEmail;
  let email;
  let usersnameID;
  hasAdminPerms = (me && me === null) ? false : (me && me.permissions2.some(permission => ['ADMIN'].includes(permission)));
  hasPerms = (me && me === null) ? false : (me && me.permissions2.some(permission => ['USER'].includes(permission)));
  hasGuestPerms = (me && me === null) ? false : (me && me.permissions2.some(permission => ['GUEST_USER'].includes(permission)));
  hasGuestEmail = me && me.email.includes("@guestuser.com");
  email = me && me.email.split("@");

  return (
  <NavStyles data-test="nav">
    <Link href="/items" passHref>
      <a>SHOP</a>
    </Link>
    {me && hasAdminPerms && (
      <Link href="/sell" passHref>
        <a>SELL</a>
      </Link>
    )}
    {me && hasPerms && (
      <>
        <Link href="/orders" passHref>
          <a>ORDERS</a>
        </Link>
        <Link href="/account" passHref>
          <a>ACCOUNT</a>
        </Link>
        <Signout />
        <button onClick={toggleCart}>
          {me.name}
          <CartCount count={me.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)}></CartCount>
        </button>
      </>
    )}
    {me && (hasGuestPerms && hasGuestEmail) && (
      <>
      <Link href="/account" passHref>
          <a>ACCOUNT</a>
      </Link>
      <Link href="/signup" passHref>
        <a>SIGNIN</a>
      </Link>
      <button onClick={toggleCart}>
        Cart
        <CartCount count={me.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)}></CartCount>
      </button>
      </>
    )}
    {me && (hasGuestPerms && !hasGuestEmail) && (
      <>
      <Link href="/account" passHref>
          <a>ACCOUNT</a>
      </Link>
      <Link href="/signup" passHref>
        <a>SIGNIN</a>
      </Link>
      <button onClick={toggleCart}>
        {me.name != 'Guest User' ? me.name : email[0]}
        <CartCount count={me.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)}></CartCount>
      </button>
      </>
    )}
    {!me && (
      <>
      <Link href="/account" passHref>
          <a>ACCOUNT</a>
      </Link>
      <Link href="/signup" passHref>
        <a>SIGNIN</a>
      </Link>
      <button>
        Cart
        <CartCount count={0}></CartCount>
      </button>
      </>
    )}
  </NavStyles>
  );
};

export default memo(Nav);

