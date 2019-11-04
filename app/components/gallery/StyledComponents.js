import styled from 'styled-components';
import RemoveButton from '../containers/RemoveButtonContainer';

export const StyledHR = styled.hr` && {
      border: 1.2px solid black;
			border-radius: 1em;
			margin: 0 4em;
    }`;

export const StyledIcon = styled.i` && {
      width: 1.3em;
}`

export const StyledTopBarHR = styled.hr` && {
      border: 2px solid black;
      margin-left: 50px;
      margin-right: 50px;
      border-radius: 1em;
    }`;
    
export const StyledTopBarDiv = styled.div` && {
      padding-top: 1rem;
      margin-left: 70px;
    }`;

export const StyledFolderViewDiv = styled.div` && {
      height: 3em;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -ms-flex-align: center;
      -webkit-align-items: center;
      -webkit-box-align: center;
      align-items: center;
      margin: 0 4.5em;
      padding: 2em 0;
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
    
export const StyledRemoveButton = styled(RemoveButton)