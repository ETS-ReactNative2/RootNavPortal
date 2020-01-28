// @flow
import React, { Component } from 'react';
import '../../common.css';
import { StyledButton } from '../StyledComponents'; 

class RefreshButton extends Component {

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

export default RefreshButton;