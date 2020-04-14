// @flow
import React, { Component } from 'react';
import { StyledCardBody, StyledCardText  } from './StyledComponents'
import { Collapse } from 'react-bootstrap';
import TextPopup from '../common/TextPopup';
import styled from 'styled-components';

export default class CollapsableLabel extends Component {

	StyledTextOverflowContainer = styled.div` && {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
	}`;

    render() {
        const { labels, file } = this.props;
        return (
            <Collapse in={labels} >
                <div> {/* Important div do not remove. Causes lag due to rerendering child components unnecessarily */} 
                    <StyledCardBody>
                        <StyledCardText>
                            <this.StyledTextOverflowContainer>
                                {/* Inherit all styling so we can style the inside of the popup using a styled component*/}
                                <TextPopup displayText={file} popupText={file} placement="top"/>
                            </this.StyledTextOverflowContainer>
                        </StyledCardText>
                    </StyledCardBody>
                </div>
            </Collapse>
        );
    }
};