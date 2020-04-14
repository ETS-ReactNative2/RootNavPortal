// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class ClearButton extends Component {
    render() {
        return (
            <TooltipOverlay  component={ props => <StyledButton
                    variant="danger" 
                    className={`btn btn-default fas fa-times button`}
                    onClick={this.props.resetPlugins} 
                    {...props}
                />} 
                text={"Clear Selected Plugins"}
            />     
        )
    }
}