// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class LeftButton extends Component {

    render() {    
        return (
            <TooltipOverlay  component={ props => <span className="d-inline-block" {...props}><StyledButton
                    variant="secondary" 
                    disabled={this.props.disabled}
                    onClick={() => this.props.click(-1)} 
                    className={`btn btn-default fa fa-arrow-left button`} 
                    {...props}
                /></span>} 
                text={"Previous Image"}
            /> 
        )
    }
}