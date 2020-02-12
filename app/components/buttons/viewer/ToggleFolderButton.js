// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

class RemoveButton extends Component {

    render() {    
    
        return (
            <StyledButton
                variant="dark" 
                onClick={() => {}} 
                className={`btn btn-default fas fa-folder button`} 
            />    
        )
    }
}

export default RemoveButton;