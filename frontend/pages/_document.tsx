import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import getConfig from 'next/config';
// Only holds serverRuntimeConfig and publicRuntimeConfig from next.config.js nothing else.
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const uuidv4 = require('uuid/v4');
const Buffer = require('buffer/').Buffer;

const inlineScript = (body, nonce) => (
  <script
    type='text/javascript'
    dangerouslySetInnerHTML={{ __html: body }}
    nonce={nonce}
  />
)

interface Props {
  styleTags: any;
  styleNonce; any
}

export default class MyDocument extends Document<Props> {
  static async getInitialProps (ctx) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
        })

      const initialProps = await Document.getInitialProps(ctx)
      const { styleNonce } = ctx.res.locals //publicRuntimeConfig

      return {
        ...initialProps,
        styleTags: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
        styleNonce
      }
    } catch (error) {
      //handle error
      console.error(error)
    } finally {
      sheet.seal()
    }
  }

  render() {
    const { styleTags, styleNonce} = this.props;
    return (
      <Html lang="en" prefix="og: http://ogp.me/ns#">
        <Head nonce={styleNonce}>
          {inlineScript(`window.__webpack_nonce__="${styleNonce}"`, styleNonce)}
          {styleTags}
        </Head>
        <body>
          <Main />
          <NextScript nonce={styleNonce} />
        </body>
      </Html>
    );
  }
}

