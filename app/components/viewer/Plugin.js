// @flow
import React, { Component } from 'react';
import { StyledListGroupItem, } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents';
import TooltipOverlay from '../common/TooltipOverlay';
import { Row } from 'react-bootstrap';

export default class Plugin extends Component {
    render() {
        const { name, active, description } = this.props;
        return (
            <StyledListGroupItem action variant={active ? 'success' : 'light'}>
                <Row>
                    <div className="col-1" style={{ display: "flex", alignItems: "center" }}>
                        <TooltipOverlay  component={ props => <StyledIcon
                                className={"fas fa-info-circle"}
                                {...props}
                            />} 
                            text={description}
                            placement={"top"}
                        /> 
                    </div>
                    <div className="col-10" style={{textAlign: "center"}}>{name}</div>
                </Row>
            </StyledListGroupItem>
        );
    }
}