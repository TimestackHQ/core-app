import '../styles/globals.css'
import { useEffect, Fragment } from "react";
import Head from "next/head";
import {Provider} from "react-redux";
import {createWrapper} from "next-redux-wrapper";
import store from "../store";
import AuthCheck from "../components/AuthCheck";
import Script from "next/script";
import 'react-big-calendar/lib/sass/styles.scss';
import * as React from "react";


function MyApp({ Component, pageProps }) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);



  return (
      <Fragment>
          <Script src="https://kit.fontawesome.com/496369c1d1.js"/>
          <Head>
              <title>Timestack</title>
              <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon" />
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
                    rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD"
                    crossOrigin="anonymous"/>
              <link rel="stylesheet" href="https://use.typekit.net/ver6zds.css"/>

          </Head>
          <Provider store={store}>
              <AuthCheck>
                  <Component {...pageProps} />

              </AuthCheck>
          </Provider>

      </Fragment>
  );
}

const makeStore = () => store;
const wrapper = createWrapper(makeStore);
export default wrapper.withRedux(MyApp);
