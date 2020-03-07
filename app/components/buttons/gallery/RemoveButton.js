// @flow
import React, { Component, useState, useRef } from 'react';
import { writeConfig } from '../../../constants/globals';
import { StyledButton } from '../StyledComponents'; 
import { Overlay, Tooltip } from 'react-bootstrap';

export default class RemoveButton extends Component {

    deleteFolder = () => {
        const { folders, path, apiAddress, apiKey } = this.props;
        if (!path) return;
        const filteredPaths = folders.filter(folder => folder.path !== path);
        writeConfig(JSON.stringify({ apiAddress, apiKey, folders: filteredPaths }, null, 4));
        this.props.remove(path);
    }
    
    overlayedButton = () => {
        const [show, setShow] = useState(false);
        const target = useRef(null);
        
         //Other animation is 'grow'. Border gets a bit crazy when lots get out of sync with each other
        let button = <StyledButton variant="danger" onClick={e => {
                            this.deleteFolder();
                            e.stopPropagation()
                        }}      
                        className={`btn btn-default fas fa-trash-alt button`} 
                        ref={target}
                        onMouseEnter={() => setShow(true)} 
                        onMouseLeave={() => setShow(false)}
                     />

        return (
            <>
                <Overlay target={target.current} show={show} placement="top">
                {({ placement, scheduleUpdate, arrowProps, outOfBoundaries, show: _show, ...props }) => (
                    <Tooltip placement={"top-start"} {...props}> Remove Folder </Tooltip>
                )}
                </Overlay>
                {button}
            </>
        )
    }

    render() { 
        return (
            <this.overlayedButton />
        )
    }
}