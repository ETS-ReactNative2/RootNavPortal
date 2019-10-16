// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';
import { Button, ButtonToolbar } from 'react-bootstrap';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Home</h2>
        <Link to={routes.COUNTER}>to Counter</Link>
        <br />
        <ButtonToolbar>
          <Button variant="success">Hi I'm button</Button>
        </ButtonToolbar>
      </div>
    );
  }
}
