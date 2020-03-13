// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../TooltipOverlay';

export default class RightButton extends Component {

    render() {    
        return (
            <TooltipOverlay  component={ props => <StyledButton
                    variant="secondary" 
                    onClick={() => this.props.click(1)} 
                    className={`btn btn-default fas fa-arrow-right button`} 
                    {...props}
                />} 
                text={"Next Image"}
            />    
        )
    }
}