// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../TooltipOverlay';

export default class RefreshButton extends Component {

    render() {    
        return (
            <TooltipOverlay  component={ props => <StyledButton
                    variant="primary" 
                    className={`btn btn-default fas fa-sync button`} 
                    onClick={() => {}} 
                    {...props}
                />} 
                text={"Reload Plugins"}
            />    
        )
    }
}