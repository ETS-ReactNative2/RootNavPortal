// @flow
import React, { Component } from 'react';
import styles from './TopBar.css';
import { ButtonToolbar } from 'react-bootstrap';
import Button from '../Button';
import FilterBar from './FilterBar'
import DateRange from './DateRange';
import styled from 'styled-components';

type Props = {};

export default class TopBar extends Component<Props> {
  props: Props;

  render() {
    const StyledHR = styled.hr` && {
      border: 2px solid black;
      margin-left: 50px;
      margin-right: 50px;
      border-radius: 1em;
    }`;

    const StyledDiv = styled.div` && {
      padding-top: 1rem;
      margin-left: 70px;
    }`;

    return (
      <div>
        <StyledDiv className="d-inline-flex" data-tid="container">
          <Button variant="success" icon="plus"/>
          <Button variant="primary" icon="sync"/>
          <FilterBar/>
          <DateRange />
          <Button variant="danger" icon="times" />
        </StyledDiv>
        <StyledHR/>
      </div>
    );
  }
}
