import styled from 'styled-components';
import { Button, Modal } from 'react-bootstrap';

export const StyledButton = styled(Button)` && {
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
  margin: 0px 0.5em;
}`


export const StyledModal = styled(Modal)` && {
  color: black;
  white-space: pre-wrap;
  min-width: max-content !important; 
}`   
//min-width gets totally ignored. even inline on the modal component