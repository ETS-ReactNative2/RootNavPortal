import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import routes from './constants/routes';
import GalleryPage from './containers/GalleryPage';
import ViewerPage from './containers/ViewerPage';

class Routes extends Component {

  static Views(tag = "", exts = "") {
    return {
      [routes.GALLERY]: <GalleryPage/>,
      [routes.VIEWER]: <ViewerPage path={tag} exts={exts}/>,
      [routes.HOME]: <GalleryPage/>
    }
  }

  static View(props) {
    let args = props.location.search.match(/(\?[^?]+)\??([^%]+)?\%?(.+)?/) //this matches the passed URL into 3 groups - ?viewer, ?folder/filepath, and %rsml%png%etc. The negated sets are to delimit the capture groups
    let name = args[1] ? args[1] : "";
    let exts = args[3] ? args[3].split('%') : "";

    let view = Routes.Views(args[2], exts)[name];
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