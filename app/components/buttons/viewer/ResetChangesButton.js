// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class ResetChanges extends Component {

    render() {    
        return (
            <TooltipOverlay  component={ props => <StyledButton
                    variant="danger" 
                    onClick={() => this.props.editStack.length ? this.props.resetEditStack() : 0} //Cut action if not needed
                    className={`btn btn-default fa fa-trash-restore button`} 
                    {...props}
                />} 
                text={"Reset RSML Changes"}
            /> 
        )
    }
}