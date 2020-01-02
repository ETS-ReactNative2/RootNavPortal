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

  static Views(arg = "") {
    console.log(arg);
    return {
      [routes.COUNTER]: <CounterPage/>,
      [routes.GALLERY]: <GalleryPage/>,
      [routes.VIEWER]: <ViewerPage path={arg.substring(1)}/>,
      [routes.HOME]: <HomePage/>
    }
  }

  static View(props) {
    let args = props.location.search.match(/(\?[^?]+)(\?.+)?/)
    let name = args[1];
    let view = Routes.Views(args[2])[name];
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