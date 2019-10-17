// @flow
import React, { Component } from 'react';
import styles from './TopBar.css';
import { ButtonToolbar } from 'react-bootstrap';
import Button from '../Button';

type Props = {};

export default class TopBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <ButtonToolbar>
          <Button variant="success" icon="plus"/>
        </ButtonToolbar>
      </div>
    );
  }
}
