// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class RightButton extends Component {

    render() {    
        return (
            <TooltipOverlay  component={ props => <span className="d-inline-block" {...props}><StyledButton
                    variant="secondary" 
                    disabled={this.props.disabled}
                    onClick={() => this.props.click(1)} 
                    className={`btn btn-default fa fa-arrow-right button`} 
                    {...props}
                /></span>} 
                text={"Next Image"}
            />    
        )
    }
}