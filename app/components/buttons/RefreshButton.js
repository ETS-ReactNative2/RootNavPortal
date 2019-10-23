// @flow
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import '../common.css';

class RefreshButton extends Component {

    render() {
        const StyledButton = styled(Button)` && {
            width: 2.5em;
            height: 2.5em;
            max-width: 2.5em;
            min-width: 2.5em;
            max-height: 2.5em;
            min-height: 2.5em;
            padding: 6px 0px;
            text-align: center;
            font-size: 20px;
            border-radius: 30px;
            margin: 0px 10px;
        }`

        return (
            <StyledButton
                variant="primary" 
                className={`btn btn-default fas fa-sync button`} 
            />    
        )
    }
}

export default RefreshButton;