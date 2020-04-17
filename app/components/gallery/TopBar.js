// @flow
import React, { Component } from 'react';
import AddButton from '../containers/gallery/AddButtonContainer';
import RefreshButton from '../containers/gallery/RefreshButtonContainer';
import FilterBar from '../containers/gallery/FilterBarContainer'
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import ServerIndicator from '../containers/gallery/ServerIndicatorContainer';
import OpenViewerButton from '../buttons/gallery/OpenViewerButton';

import styled from 'styled-components';

export default class TopBar extends Component {
    labelDiv = styled.div(`
        margin: auto 0 auto 1em;
    `);

    render() {
        return (
            <div>
                <StyledTopBarDiv className="d-inline-flex" data-tid="container">
                    <AddButton />
                    <RefreshButton />
                    <FilterBar/>
                    <this.labelDiv className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em'}}>
                        <input type="checkbox" className="custom-control-input" id="labels" defaultChecked={false} onClick={this.props.toggleLabels}/>
                        <label className="custom-control-label" htmlFor="labels">Display Names</label>
                    </this.labelDiv>
                    <this.labelDiv className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em'}}>
                        <input type="checkbox" className="custom-control-input" id="drawRsml" defaultChecked={true} onClick={this.props.toggleArch}/>
                        <label className="custom-control-label" htmlFor="drawRsml">Draw Architecture</label>
                    </this.labelDiv>
                    <div style={{ marginLeft: 'auto' }} >
                        <OpenViewerButton />
                        <ServerIndicator />
                    </div>
                </StyledTopBarDiv>
                <StyledTopBarHR/>
            </div>
        );
    }
}
