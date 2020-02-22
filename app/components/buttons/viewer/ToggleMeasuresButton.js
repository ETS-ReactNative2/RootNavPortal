// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

export default class ToggleMeasuresButton extends Component {

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