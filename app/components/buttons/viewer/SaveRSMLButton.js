// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

export default class SaveRSMLButton extends Component {

    render() {    
        return (
            <StyledButton
                variant="primary" 
                onClick={() => {}} 
                className={`btn btn-default fa fa-save button`} 
            />    
        )
    }
}