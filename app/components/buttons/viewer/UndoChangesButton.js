// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class UndoChanges extends Component {

    render() {
        const isActive = this.props.editStack.length;  
        return (
            <TooltipOverlay  component={ props => <span className="d-inline-block" {...props}><StyledButton
                    variant="warning" 
                    disabled={!isActive}
                    style={{pointerEvents: isActive ? 'all' : 'none' }}
                    onClick={() => isActive ? this.props.popEditStack() : 0} //Cut action if not needed
                    className={`btn btn-default fa fa-undo button`}
                /></span>
            } 
                text={"Undo RSML Changes"}
            />
        )
    }
}