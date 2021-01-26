import React, {FC} from "react";
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import SingleItem from '../components/SingleItem';

import SingleItemStyles from '../public/static/SingleItemStyles.css';

interface Props {
  query?: {
    id: string
  };
  userAgent?: string;
  userIP?: any;
}

const Item: NextPage<Props> = ({ query, userAgent, userIP }) => {

  const router = useRouter();

  return(
    <>
      <style dangerouslySetInnerHTML={{ __html: SingleItemStyles }} />
      <SingleItem id={query.id} user_ip={userIP} user_Agent={userAgent} url={router.asPath} />
    </>
  );
}

Item.getInitialProps = async ({ req }) => {
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const userIP = req ? (req.headers['x-real-ip'] || req.connection.remoteAddress) : false;
  const urlReferer = req ? req.headers['referer'] : document.referrer;

  return { userAgent, userIP, urlReferer }
}

export default Item

