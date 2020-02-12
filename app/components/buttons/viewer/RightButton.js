// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

class RemoveButton extends Component {

    render() {    
        return (
            <StyledButton
                variant="secondary" 
                onClick={() => this.props.click(1)} 
                className={`btn btn-default fas fa-arrow-right button`} 
            />    
        )
    }
}

export default RemoveButton;