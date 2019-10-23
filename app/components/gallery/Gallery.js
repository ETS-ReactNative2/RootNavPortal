// @flow
import React, { Component } from 'react';
import styles from './Gallery.css';
import TopBar from './TopBar';
import FileViewport from '../containers/FileViewContainer';

type Props = {};

export default class Gallery extends Component<Props> {
  props: Props;

  render() {
    return (
      <div data-tid="container">
          <TopBar />
          <FileViewport />
      </div>
    );
  }
}
