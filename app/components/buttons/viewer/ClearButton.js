// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

export default class ClearButton extends Component {
    render() {
        return (
            <StyledButton
                variant="danger" 
                className={`btn btn-default fas fa-times button`} 
            />    
        )
    }
}