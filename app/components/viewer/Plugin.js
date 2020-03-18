// @flow
import React, { Component } from 'react';
import { StyledListGroupItem, } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents';
import TooltipOverlay from '../common/TooltipOverlay';

export default class Plugin extends Component {
    render() {
        const { name, active, description } = this.props;
        return (
            <StyledListGroupItem action variant={active ? 'success' : 'light'}>
                <TooltipOverlay  component={ props => <StyledIcon //Make sure I'm still left aligned when the text gets centred else everything will be wonky
                        className={"fas fa-info-circle"} 
                        {...props}
                    />} 
                    text={description}
                    placement={"top"}
                /> 
                {name}
            </StyledListGroupItem>
        );
    }
}