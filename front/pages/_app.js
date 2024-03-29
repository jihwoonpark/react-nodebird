import React from 'react';
import PropTypes from 'prop-types'
import Head from 'next/head';
import 'antd/dist/antd.css';
import wrapper from '../store/configureStore';
// import withReduxSaga from 'next-redux-saga'; //더이상 필요없어짐

function App({Component}) {
  return (
    <>
    <Head>
      <meta charSet="utf-8"/>
      <title>NodeBird</title>
    </Head>
      <Component/>
    </>
  );
}

App.propTypes = {
  Component:PropTypes.element.isRequired
}

export default wrapper.withRedux(App);

