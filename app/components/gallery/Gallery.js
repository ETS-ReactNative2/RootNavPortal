// @flow
import React, { Component } from 'react';
import styles from './Gallery.css';
import TopBar from './TopBar';
import GalleryView from '../containers/GalleryViewContainer';
import { existsSync, readFile } from 'fs';
import { APPHOME, CONFIG } from '../../constants/globals';

type Props = {};

export default class Gallery extends Component<Props> {
  props: Props;

  render() {

    if (!this.props.hasReadConfig) 
    {
      console.log(APPHOME + CONFIG)
      if (existsSync(APPHOME + CONFIG)) 
      {
        readFile(APPHOME + CONFIG, "utf8", (err, data) => 
        {
          if (err) console.log(err); 
          else this.props.importConfig(JSON.parse(data))
        }); 
      }
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
