// @flow
import React, { Component } from 'react';
import styles from './Gallery.css';
import TopBar from './TopBar';
import GalleryView from '../containers/GalleryViewContainer';
import { existsSync, readFileSync } from 'fs';
import { APPHOME, CONFIG } from '../../constants/globals';

type Props = {};

export default class Gallery extends Component<Props> {
  props: Props;

  render() {

    console.log("Rendering galelry")
    if (!this.props.hasReadConfig) 
    {
      console.log("Not read")
      if (existsSync(APPHOME + CONFIG))
        readFileSync(APPHOME + CONFIG, (err, data) => { if (err)
           console.log(err); 
           console.log("hello I've read"); 
           
           console.log(data); 
           this.props.importConfig(JSON.parse(data))
       }); 
       else console.log("doesn't exist: " + APPHOME+CONFIG);          
    }

    return (
      <div data-tid="container">
          <TopBar />
          <GalleryView />
      </div>
    );
  }
}
