import App, { AppProps  } from 'next/app';
import Page from '../components/Page';
import { ApolloProvider, ApolloClient } from '@apollo/client';
import withData from '../lib/withData';
import { CartStateProvider } from '../components/LocalState';

interface Props {
  apollo: ApolloClient<{}>;
}

const MyApp = ({ Component, pageProps, apollo }: AppProps & Props) => {
  return (
    <ApolloProvider client={apollo}>
      <CartStateProvider>
        <Page>
          <Component {...pageProps} />
        </Page>
      </CartStateProvider>
    </ApolloProvider>
  );
}
// every page in the app will be server-side rendered because data has to be fetched before rendering
MyApp.getInitialProps = async (props): Promise<{}> => {
  const { Component, ctx } = props;
  let pageProps: any;

  // this runs first, before the App is rendered
  if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
  }

  // this exposes the query to the user
  pageProps.query = ctx.query;
  return { pageProps };
};

export default withData(MyApp);

