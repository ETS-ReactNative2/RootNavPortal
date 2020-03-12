// @flow
import React, { Component, useState, useRef} from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';

export default class TooltipOverlay extends Component {

    overlayedComponent = () => { //Overlays a tooltip around whatever component is passed
        const [show, setShow] = useState(false);
        const target = useRef(null);
        
        let button = this.props.component({
                ref: target,
                onMouseEnter: () => setShow(true),
                onMouseLeave: () => setShow(false)
            });

        return (
            <>
                <Overlay target={target.current} show={show} placement={this.props.placement || "top"} containerPadding={-100}>
                {({ show, ...props }) => (
                    <Tooltip {...props}>{this.props.text}</Tooltip>
                )}
                </Overlay>
                {button}
            </>
        )
    }

    render() {    
        return <this.overlayedComponent/>    
    }
}