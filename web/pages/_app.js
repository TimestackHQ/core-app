import "bootstrap/dist/css/bootstrap.min.css";
import '../styles/globals.css'
import { useEffect, Fragment } from "react";
import Head from "next/head";
import {Provider} from "react-redux";
import {createWrapper} from "next-redux-wrapper";
import store from "../store";
import AuthCheck from "../components/AuthCheck";
import Script from "next/script";
import 'react-big-calendar/lib/sass/styles.scss';


function MyApp({ Component, pageProps }) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
      <Fragment>
          <Script src="https://kit.fontawesome.com/496369c1d1.js"/>
          <Head>
              <title>Timestack</title>
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
