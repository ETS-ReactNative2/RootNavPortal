import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';

export const StyledHR = styled.hr` && {
      border: 1.2px solid black;
			border-radius: 1em;
			margin: 0 4em;
    }`;

export const StyledFolderViewDiv = styled.div` && {
      min-height: 3em;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -ms-flex-align: center;
      -webkit-align-items: center;
      -webkit-box-align: center;
      align-items: center;
      margin: 0 4.5em;
      padding: 0.5em 0;
    }`;
    
export const StyledFilterBarSpan = styled.span` && {
      width: 50%;
      margin: auto 0 auto 1em;
    }`

export const StyledGalleryViewH1 = styled.h1` && {
      margin-left: 1.5em
    }`
    
export const StyledGalleryViewDiv = styled.div` && {
      position: fixed;
      overflow-y: auto;
      bottom: 0;
      top: 10em;
      left: 0;
      right: 0;
    }`
    
export const StyledImage = styled.img` && {
      max-width:10em;
      max-height:10em;
      
}`

export const StyledCol = styled(Col)` && {
      text-align: center;
}`

export const StyledRow = styled(Row)` && {
      padding-bottom: 1em; 
}`