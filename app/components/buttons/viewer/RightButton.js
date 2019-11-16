// @flow
import React, { Component } from 'react';
import '../../common.css';
import { StyledButton } from '../StyledComponents'; 

class RemoveButton extends Component {

    render() {    
        return (
            <StyledButton
                variant="secondary" 
                onClick={""} 
                className={`btn btn-default fas fa-arrow-right button`} 
            />    
        )
    }
}

export default RemoveButton;