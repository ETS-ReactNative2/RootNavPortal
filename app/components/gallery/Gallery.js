// @flow
import React, { Component } from 'react';
import styles from './Gallery.css';
import TopBar from './TopBar';
import GalleryView from '../containers/GalleryViewContainer';

type Props = {};

export default class Gallery extends Component<Props> {
  props: Props;

  render() {
    return (
      <div data-tid="container">
          <TopBar />
          <GalleryView />
      </div>
    );
  }
}
