// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class LeftButton extends Component {

    render() {    
        return (
            <TooltipOverlay component={ props => <StyledButton
                    style={{marginRight: "2em"}} 
                    variant="secondary" 
                    onClick={() => this.props.click(-1)} 
                    className={`btn btn-default fas fa-arrow-left button`} 
                    {...props}
                />} 
                text={"Previous Image"}
            /> 
        )
    }
}