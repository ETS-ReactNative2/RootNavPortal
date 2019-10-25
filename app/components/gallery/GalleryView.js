// @flow
import React, { Component } from 'react';
import styles from './GalleryView.scss';
import FolderView from './FolderView';
type Props = {};

export default class GalleryView extends Component<Props> {
  props: Props;

  render() {
    const { folders } = this.props;
    console.log(folders);
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.title}>
          <h1>Open Folders</h1>
        </div>
        {
          folders.map((item, i) => {
            if (folders.length > 0)
              return <FolderView key={item} folder={item}/>;
          })
        }
      </div>
    );
  }
}