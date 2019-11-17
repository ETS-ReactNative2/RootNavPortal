// @flow
import React, { Component } from 'react';
import '../../common.css';
import { StyledButton } from '../StyledComponents'; 

class ClearButton extends Component {
    render() {
        return (
            <StyledButton
                variant="danger" 
                className={`btn btn-default fas fa-times button`} 
            />    
        )
    }
}

export default ClearButton;