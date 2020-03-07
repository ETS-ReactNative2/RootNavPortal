import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import Store from './store/configureStore';
import './bootstrap.global.css';
import './app.global.scss';
// import './fontawesome.global.css';


const { configureStore, history } = Store('renderer');
const store = configureStore({}, 'renderer');
const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);
