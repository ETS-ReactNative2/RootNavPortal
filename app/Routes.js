import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import GalleryPage from './containers/GalleryPage';
import ViewerPage from './containers/ViewerPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.COUNTER} component={CounterPage} />
      <Route path={routes.GALLERY} component={GalleryPage} />
      <Route path={routes.VIEWER} component={ViewerPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
