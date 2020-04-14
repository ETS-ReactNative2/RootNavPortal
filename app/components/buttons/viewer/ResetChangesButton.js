// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class ResetChanges extends Component {

    render() {    
        const isActive = this.props.editStack.length;
        return (
            <TooltipOverlay  component={ props => <span className="d-inline-block" {...props}><StyledButton
                    variant="danger" 
                    disabled={!isActive}
                    style={{pointerEvents: isActive ? 'all' : 'none' }}
                    onClick={() => isActive ? this.props.resetEditStack() : 0} //Cut action if not needed
                    className={`btn btn-default fa fa-trash-restore button`} 
                /></span>
            } 
                text={"Reset RSML Changes"}
            /> 
        )
    }
}