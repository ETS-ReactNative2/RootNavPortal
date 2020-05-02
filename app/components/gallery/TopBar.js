// @flow
import React, { Component } from 'react';
import AddButton from '../containers/gallery/AddButtonContainer';
import RefreshButton from '../containers/gallery/RefreshButtonContainer';
import FilterBar from '../containers/gallery/FilterBarContainer'
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import ServerIndicator from '../containers/gallery/ServerIndicatorContainer';
import OpenViewerButton from '../buttons/gallery/OpenViewerButton';
import { Dropdown } from 'react-bootstrap';
import { remote } from 'electron';

import styled from 'styled-components';

export default class TopBar extends Component {
    hamburgerMaxSize = 1250;

    constructor(props) {
        
        super(props);
        this.state = {
            showHamburger: remote.getCurrentWindow().getSize()[0] < this.hamburgerMaxSize
        };

        window.addEventListener('resize', e => {
            this.setState({showHamburger: remote.getCurrentWindow().getSize()[0] < this.hamburgerMaxSize })
        });    
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.showHamburger != this.state.showHamburger;
    }

    labelDiv = styled.div(`
        margin: auto 0 auto 1em;
    `);

    noCaretToggle = styled(Dropdown.Toggle)`
        box-shadow: none !important;
        padding: 0;
        margin: 0.2em;
        font-size: 30px;
        :after {
            display: none;
    }`;

    dropdownDiv = styled.div`
        height: fit-content;
        place-self: center;        
    `


    standardTop = () => <StyledTopBarDiv className="d-inline-flex" data-tid="container">
        <AddButton />
        <RefreshButton />
        <FilterBar/>
        <this.labelDiv className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em'}}>
            <input type="checkbox" className="custom-control-input" id="labels" defaultChecked={this.props.labels} onClick={this.props.toggleLabels}/>
            <label className="custom-control-label" htmlFor="labels">Display Names</label>
        </this.labelDiv>
        <this.labelDiv className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em'}}>
            <input type="checkbox" className="custom-control-input" id="drawRsml" defaultChecked={this.props.architecture} onClick={this.props.toggleArch}/>
            <label className="custom-control-label" htmlFor="drawRsml">Draw Architecture</label>
        </this.labelDiv>
        <div style={{ marginLeft: 'auto' }} >
            <OpenViewerButton />
            <ServerIndicator />
        </div>
    </StyledTopBarDiv>

    hamburger = () => 
        <Dropdown as={this.dropdownDiv}>
            <this.noCaretToggle variant="success" id="dropdown-basic"
                variant="white" 
                className={`btn btn-default fas fa-bars button`} 
            >
            </this.noCaretToggle>
            <Dropdown.Menu popperConfig={{offset: "10, 10"}}>
                <RefreshButton isDropdown/>
                <this.labelDiv className="custom-control custom-checkbox" style={{margin: '0 24px 0 24px', padding: '4px 0 4px 24px'}}>
                    <input type="checkbox" className="custom-control-input" id="labels" defaultChecked={this.props.labels} onClick={this.props.toggleLabels}/>
                    <label className="custom-control-label" htmlFor="labels">Display Names</label>
                </this.labelDiv>
                <this.labelDiv className="custom-control custom-checkbox" style={{margin: '0 24px 0 24px', padding: '4px 0 4px 24px'}}>
                    <input type="checkbox" className="custom-control-input" id="drawRsml" defaultChecked={this.props.architecture} onClick={this.props.toggleArch}/>
                    <label className="custom-control-label" htmlFor="drawRsml">Draw Architecture</label>
                </this.labelDiv>
            </Dropdown.Menu>
        </Dropdown>    

    hamburgerTop = () =>
        <StyledTopBarDiv hamburger className="d-inline-flex" data-tid="container">
            <this.hamburger/>
            <AddButton />
            <FilterBar/>
            <div style={{ marginLeft: 'auto' }} >
                <OpenViewerButton />
                <ServerIndicator />
            </div>
        </StyledTopBarDiv>

    render() {
        return (<>
        {this.state.showHamburger ? <this.hamburgerTop/> : <this.standardTop/>}
        <StyledTopBarHR/>
        </>);
    }
}
