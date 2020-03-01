import styled from 'styled-components';
import { Card, ListGroupItem, Row, Button } from 'react-bootstrap';
import FolderChecklist from '../containers/viewer/FolderListContainer';


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
    margin: 1em;
}`

export const StyledCardContents = styled.div` && {
    overflow-y:overlay;
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
}`

export const StyledFolderChecklist = styled(FolderChecklist).attrs({border:"dark"})` && {
}`

export const StyledMeasureButton = styled(Button)` && {
    margin-top:auto;
    transition: 0.2s ease-in-out;
}`
