import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import GalleryPage from './containers/GalleryPage';
import ViewerPage from './containers/ViewerPage';

class Routes extends Component {

  static Views() {
    return {
      [routes.COUNTER]: <CounterPage/>,
      [routes.GALLERY]: <GalleryPage/>,
      [routes.VIEWER]: <ViewerPage/>,
      [routes.HOME]: <HomePage/>
    }
  }

  static View(props) {
    let name = props.location.search;
    console.log(props)
    let view = Routes.Views()[name];
    if(view == null) 
      view = Routes.Views()[routes.HOME];
    return view;
  }
  
  render() {
    return (
      <Router>
        <div>
          <Route path='/' component={Routes.View}/>
        </div>
      </Router>
    );
  }
}

export default Routes