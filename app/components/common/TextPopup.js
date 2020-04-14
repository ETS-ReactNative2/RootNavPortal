import React, { useState, useRef } from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';

export default props => {
	const { displayText, popupText, placement } = props;
	const [show, setShow] = useState(false);
	const target = useRef(null);
	return (
		<>
			{/* all:inherit to get any styling from the outside! */}
			<div style={{all: "inherit"}} ref={target} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
				{displayText}
			</div>
			<Overlay target={target.current} containerPadding={-100} show={show} placement={placement}>
				{({ show, ...props }) => (
					<Tooltip id="overlay-example" {...props}>
						{popupText}
					</Tooltip> 
				)}
			</Overlay>
		</>
	);
};
