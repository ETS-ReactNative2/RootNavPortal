// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class ServerIndicator extends Component {

    getVariant = () => {
        const { apiAddress, apiKey, apiStatus } = this.props;

        if (!navigator.onLine) return "danger";
        if (!apiAddress || !apiKey || !apiStatus) return "warning";
        if (apiStatus) return "success";
    }

    getText = () => {
        const { apiAddress, apiKey, apiStatus } = this.props;

        if (!navigator.onLine) return "No internet connection";
        if (!apiAddress || !apiKey) return "Server settings are empty";
        if (!apiStatus) return "Specified server is unreachable";
        if (apiStatus) return "Server is online";
    }

    render() {
        return <TooltipOverlay  component={ props => <StyledButton
                variant={this.getVariant()}
                className={`btn btn-default fas fa-server button`}
                onClick={e => {
                    this.props.updateAPIModal(true);
                    e.stopPropagation()
                }}      
                style={{ transition: '0.2s ease-in-out', marginLeft: 'auto' }}
                {...props}
            />} 
            text={this.getText()}
            placement={"bottom"}
        /> 
    }
}
