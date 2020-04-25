// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class ToggleFailedButton extends Component {

    render() {    
        return (
            <TooltipOverlay  component={ props => <span className="d-inline-block" {...props}><StyledButton
                    variant={this.props.isSetFailed ? "info" : "danger"} 
                    disabled={this.props.disabled}
                    onClick={this.props.toggleFailed}
                    className={`btn btn-default fa button ` + (this.props.isSetFailed ? "fa-check" : "fa-ban")} 
                    {...props}
                /></span>} 
                text={this.props.isSetFailed ? "Unset as Failed" : "Set as Failed"}
            /> 
        )
    }
}