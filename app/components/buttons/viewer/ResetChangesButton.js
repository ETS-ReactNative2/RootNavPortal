// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 

export default class ResetChanges extends Component {

    render() {    
        return (
            <StyledButton
                variant="danger" 
                onClick={() => this.props.editStack.length ? this.props.resetEditStack() : 0} //Cut action if not needed
                className={`btn btn-default fa fa-trash-restore button`} 
            />    
        )
    }
}