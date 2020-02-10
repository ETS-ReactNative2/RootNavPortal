// @flow
import React, { Component } from 'react';
import styles from './Gallery.css';
import TopBar from './TopBar';
import GalleryView from '../containers/gallery/GalleryViewContainer';
import { existsSync, readFile } from 'fs';
import { APPHOME, CONFIG } from '../../constants/globals';

type Props = {};

export default class Gallery extends Component<Props> {
  render() {

    if (!this.props.hasReadConfig) 
    {
      if (existsSync(APPHOME + CONFIG)) 
      {
        readFile(APPHOME + CONFIG, "utf8", (err, data) => 
        {
          if (err) console.err(err); 
          else this.props.importConfig(JSON.parse(data));
        }); 
      }
      else console.err("doesn't exist: " + APPHOME+CONFIG);     
    }

    return (
      <div data-tid="container">
          <TopBar />
          <GalleryView />
      </div>
    );
  }
}
