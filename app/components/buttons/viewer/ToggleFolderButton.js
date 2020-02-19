// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

export default class ToggleFolderButton extends Component {

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