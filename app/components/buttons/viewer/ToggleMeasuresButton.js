// @flow
import React, { Component } from 'react';
import '../../common.css';
import { StyledButton } from '../StyledComponents'; 

class RemoveButton extends Component {

    render() {    
        return (
            <StyledButton
                variant="info" 
                onClick={() => {}} 
                className={`btn btn-default fa fa-chart-line button`} 
            />    
        )
    }
}

export default RemoveButton;