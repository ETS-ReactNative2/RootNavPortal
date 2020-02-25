import styled from 'styled-components';
import { Card, ListGroupItem, Row } from 'react-bootstrap';


export const StyledListGroupItem = styled(ListGroupItem)` && {
    padding: 0.5em;
    color: black;
    border-radius: 0;
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
}`

export const StyledCard = styled(Card).attrs({border:"dark"})` && {
    width: 15em;
    margin-bottom: 1em;
    overflow-y:auto;
}`

export const StyledChevron = styled.div` && {
    align-items: center;
    display: flex;
}`

export const StyledSidebarContainer = styled.div` && {
    display: flex;
    justify-content: space-between;
    height: 100%
}`