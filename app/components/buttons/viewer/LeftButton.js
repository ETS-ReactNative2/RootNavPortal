// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

export default class LeftButton extends Component {

    render() {    
        return (
            <StyledButton
                variant="secondary" 
                onClick={() => this.props.click(-1)} 
                className={`btn btn-default fas fa-arrow-left button`} 
            />    
        )
    }
}