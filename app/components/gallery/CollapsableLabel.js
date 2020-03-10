// @flow
import React, { Component } from 'react';
import { StyledCardBody, StyledCardText  } from './StyledComponents'
import { Collapse } from 'react-bootstrap';
import styled from 'styled-components';

export default class CollapsableLabel extends Component{

	StyledTextOverflowContainer = styled.div` && {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
	}`;

    render() {
        const { labels, file } = this.props;
        return (
            <Collapse in={labels}>
                <div> 
                <StyledCardBody>
                    <StyledCardText>
                        <this.StyledTextOverflowContainer>
                            {file}
                        </this.StyledTextOverflowContainer>
                    </StyledCardText>
                </StyledCardBody>
                </div>
            </Collapse>
        );
    }
}