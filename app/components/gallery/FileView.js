// @flow
import React, { Component } from 'react';
import styles from './FileView.scss';
import FolderView from './FolderView';

type Props = {};

export default class FileView extends Component<Props> {
  props: Props;

  render() {
    const { folders } = this.props;
    console.log(folders);
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.title}>
          <h1>Open Folders</h1>
        </div>
        {/*
          //This doesn't work. It fires with index 0 on an empty array, it also doesn't update with state
          //Kind of assumed it would. I'm probably wrong.
          Array.apply(null, Array(Object.keys(folders)).map((item, i) => {
            console.log(i);
              return <FolderView key={i} folder={folders[i]}/>
          }))*/
        }
      </div>
    );
  }
}