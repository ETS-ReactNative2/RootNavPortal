// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import './common.css';

//Circular styling - fixed size is bad, we change later
const StyledButton = styled(Button)` && {
    width: 30px;
    height: 30px;
    padding: 6px 0px;
    text-align: center;
    font-size: 12px;
    border-radius: 15px;
}`

//Takes a 'variant' see react-bootstrap docs, and an fa-`icon` suffix
export default ({icon, variant}) => <StyledButton variant={variant} className={`btn btn-default fas fa-${icon} button`}/>