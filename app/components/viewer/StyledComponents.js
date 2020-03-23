import styled from 'styled-components';
import { Card, ListGroupItem, Row, Button } from 'react-bootstrap';

export const StyledListGroupItem = styled(ListGroupItem)` && {
    padding: 0.5em;
    color: black;
    border-radius: 0;
    transition: 0.2s ease-in-out;
}`

export const StyledCenterListGroupItem = styled(StyledListGroupItem)` && {
    display: flex;
    justify-content: space-evenly;
}`

export const StyledContainer = styled.div` && {  
    display: flex;
    flex-direction:column;
    height: 100vh;
    overflow: hidden;
}`

export const StyledRow = styled(Row)` && {
    width: 100vw;
}`

export const StyledCardHeader = styled(Card.Header)` && {
    padding: 0.5em;
    color: black;
    text-align: center;
    font-weight: bold;
    width: 100%;
    border: 1px solid rgba(0, 0, 0, .125);
    background-color: #e9ecef;
}`

export const StyledCard = styled(Card).attrs({border:"dark"})` && {
    width: 20vw;
    min-width: 240px;
    border-color: ${props => props.redborder ? "red !important" : "inherit"};
    transition: 0.4s;
}`

export const StyledRedI = styled.i` && {
    background-color: ${props => props.redborder ? "#fcc !important" : "inherit"};
    box-shadow: ${props => props.redborder ? "0px 0px 8px 2px #FFB2B2" : "inherit"};
    transition: 0.4s;
}`

export const StyledCardContents = styled.div` && {
    overflow-y: overlay;
    overflow-x: hidden;
}`

export const StyledChevron = styled.div` && {
    align-items: center;
    display: flex;
}`

export const StyledSidebarContainer = styled.div` && {
    display: flex;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;
    margin-top: 1em;
}`

export const StyledMeasureButton = styled(Button)` && {
    margin-top:auto;
    transition: 0.2s ease-in-out;
}`