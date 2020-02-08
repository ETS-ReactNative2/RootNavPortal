// @flow
import React, { Component } from 'react';
import '../../common.css';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import { DropdownButton, Dropdown, Button, Modal, Container, Col, Row } from 'react-bootstrap';
import { API_MODELS, matchPathName } from '../../../constants/globals';

class SettingsButton extends Component {

    currentModel = "Wheat (Blue Paper)"
    state = { modal: false };
    deleteMessage = "will <b>delete all RSML files</b> in this directory and resubmit images to RootNav API. This requires a working internet connection.\n\nAre you sure you want to do this?"
    
    constructor(props)
    {
        super(props);
    }

    close = () => {
        this.setState({ modal: false, confirmText: "" });
    }

    openModal = () => {
        this.setState({ modal: true, confirmText: "" });
    }

    refreshModal = confirmText => {
        this.setState({modal: false});
        setTimeout(() => this.setState({modal: true, confirmText}), 250)
    }


    renderModalBody = () => {
        return this.state.confirmText ? 
        (
            <div>
                <span dangerouslySetInnerHTML={{__html: this.state.confirmText}}/>
            </div>
        ) 
        : 
        (
            <Container>
                <Row>
                    <Col>
                        <DropdownButton style={{'display': 'inline-block'}} id="model-button" title={this.currentModel} onClick={e => e.stopPropagation()}>
                            { API_MODELS.map((model, i) => model.displayName != this.currentModel ? 
                                <Dropdown.Item 
                                    key={i} 
                                    onSelect={() => { this.refreshModal("Change <b>" + matchPathName(this.props.path)[2] + "</b> from <b>GetThisFromState</b> to " + "<b>" + model.displayName + "</b>" + "?\n\nThis " + this.deleteMessage) }}
                                >
                                    {model.displayName}
                                </Dropdown.Item> 
                                : "") 
                            }
                        </DropdownButton>
                    </Col>
                    <Col> 
                        <Button variant="danger" onClick={e => { e.stopPropagation(); this.refreshModal("Reanalysing " + this.deleteMessage) }}>Reanalyse</Button>
                    </Col>
                </Row>
            </Container>
        )
    }

    render() {    
    
        return (
            <>
            <StyledButton
                variant="secondary" 
                onClick={e => {
                    e.stopPropagation()
                    this.openModal();
                }} 
                className={`btn btn-default fas fa-wrench button`} 
            />
            <StyledModal show={this.state.modal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit settings for <strong>{matchPathName(this.props.path)[2]}</strong></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.renderModalBody()}
                    </Modal.Body>
                    <Modal.Footer style={{'justifyContent': this.state.confirmText ? 'space-between' : 'flex-end'}}>
                        {this.state.confirmText && <Button variant="danger" onClick={e => {         
                                e.stopPropagation();
                                this.close();
                            }}>
                                Confirm
                        </Button>}

                        <Button variant="secondary" onClick={e => {         
                            e.stopPropagation();
                            this.close();
                        }}>
                            Cancel
                        </Button>

                    </Modal.Footer>
                </StyledModal>
            </> 
        )
    }
}

export default SettingsButton;