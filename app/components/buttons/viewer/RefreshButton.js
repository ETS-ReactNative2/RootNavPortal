// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

export default class RefreshButton extends Component {

    render() {    
        return (
            <StyledButton
                variant="primary" 
                className={`btn btn-default fas fa-sync button`} 
                onClick={() => {}}
            />    
        )
    }
}