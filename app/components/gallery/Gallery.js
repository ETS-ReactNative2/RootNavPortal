// @flow
import React, { Component } from 'react';
import styles from './Gallery.css';
import TopBar from './TopBar';
import GalleryView from '../containers/gallery/GalleryViewContainer';
import { existsSync, readFile } from 'fs';
import { APPHOME, CONFIG } from '../../constants/globals';
import { remote } from 'electron';

type Props = {};

export default class Gallery extends Component<Props> {
  constructor(props)
  {
    super(props);
    process.env.API_STATUS = remote.getGlobal('API_STATUS');
  }
  render() {

    if (!this.props.hasReadConfig) 
    {
      if (existsSync(APPHOME + CONFIG)) 
      {
        readFile(APPHOME + CONFIG, "utf8", (err, data) => 
        {
          if (err) console.error(err); 
          else this.props.importConfig(JSON.parse(data));
        }); 
      }
      else console.error("doesn't exist: " + APPHOME+CONFIG);     
    }

    return (
      <div data-tid="container">
          <TopBar />
          <GalleryView />
      </div>
    );
  }
}
