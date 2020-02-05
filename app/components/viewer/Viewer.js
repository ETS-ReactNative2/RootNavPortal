// @flow
import React, { Component } from 'react';
import TopBar from '../containers/viewer/TopBarContainer';
import RightBar from './RightBar'
import { StyledContainer } from './StyledComponents';
import Render from '../containers/viewer/RenderContainer';
import { sep } from 'path';
import { matchPathName } from '../../constants/globals';
type Props = {};

export default class Viewer extends Component<Props> {
props: Props;

    LEFT_KEY  = "ArrowLeft";
    RIGHT_KEY = "ArrowRight";

    constructor(props)
    {
        super(props);
        const { addViewer, path } = props;
        this.state = { path };
        addViewer(process.pid);
    }

    componentDidMount()
    {
        document.addEventListener("keydown", this.handleClick, false);
    }

    componentWillUnmount()
    {
        document.removeEventListener("keydown", this.handleClick, false);
    }

    handleClick = e =>
    {
        if (e.key != this.LEFT_KEY && e.key != this.RIGHT_KEY) return;
        this.loadNextRSML(e.key == this.LEFT_KEY ? -1 : 1);
    }

    loadNextRSML = direction => {
        let split = matchPathName(this.state.path); 
        let folder = split[1].replace(/\\\\/g, '\\'); //I have a feeling this is going to need OS specific file code here, since Linux can have backslashes(?)
        let keys = Object.keys(this.props.files[folder]);
        let index = keys.indexOf(split[2]); //I'm thinking make a global func for splitting/getting dir path and file name given how much this regex pops up now
        let file;
        let initialIndex = index;
        
        do 
        {
            index += direction;
            if (index < 0) index = keys.length - 1; //Wrap left or right around the array if out of bounds
            if (index == keys.length) index = 0;
            file = this.props.files[folder][keys[index]] //Cycle through array of files in our current folder to find one with an rsml - check with Mike if we should cycle through all folders
        }
        while (!file.rsml && initialIndex != index) //Only loop through the folder once

        if (initialIndex != index) //If nothing was found, do nothing
        {
            this.setState({path: folder + sep + keys[index]});
        }
    }

    render() 
    {
        return (
            <StyledContainer>
                <TopBar path={this.state.path} buttonHandler={this.loadNextRSML}/>
                <Render path={this.state.path} />
                {/* <RightBar/> */}
            </StyledContainer>
        );
    }
}
