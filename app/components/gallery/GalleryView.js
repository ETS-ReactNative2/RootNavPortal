// @flow
import React, { Component } from 'react';
import styles from './GalleryView.scss';
import FolderView from '../containers/FolderViewContainer';
import { Accordion } from 'react-bootstrap';
import styled from 'styled-components';

type Props = {};

export default class GalleryView extends Component<Props> {
  props: Props;

  render() {
    const { folders } = this.props;
    const StyledAccordion = styled(Accordion)` && {
        color: black;
    }`
    
    return (
      <div className={styles.container} data-tid="container">
        <div className={styles.title}>
          <h1>Open Folders</h1>
        </div>
        <StyledAccordion defaultActiveKey="0">
        {
          folders.map((item, i) => {
            if (folders.length > 0)
              return <FolderView key={item} folder={item} eventKey={i} />;
          })
        }
        </StyledAccordion>
      </div>
    );
  }
}