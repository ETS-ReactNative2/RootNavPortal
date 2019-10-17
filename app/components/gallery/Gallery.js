// @flow
import React, { Component } from 'react';
import styles from './Gallery.css';
import TopBar from './TopBar';

type Props = {};

export default class Gallery extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
          <TopBar />
      </div>
    );
  }
}
