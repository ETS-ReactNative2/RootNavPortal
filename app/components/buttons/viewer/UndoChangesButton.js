// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class UndoChanges extends Component {

    render() {    
        return (
            <TooltipOverlay  component={ props => <StyledButton
                variant="warning" 
                onClick={() => this.props.editStack.length ? this.props.popEditStack() : 0} //Cut action if not needed
                className={`btn btn-default fa fa-undo button`}
                {...props}/>
            } 
            text={"Undo Changes"}/>
        )
    }
}