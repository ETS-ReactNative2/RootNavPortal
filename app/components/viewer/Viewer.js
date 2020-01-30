// @flow
import React, { Component } from 'react';
import TopBar from './TopBar';
import RightBar from './RightBar'
import { StyledContainer } from './StyledComponents';
import Render from '../containers/viewer/RenderContainer';
type Props = {};

export default class Viewer extends Component<Props> {
props: Props;

    constructor(props)
    {
        super(props);
        this.state = { path: props.path};
    }

    componentDidMount()
    {
        document.addEventListener("keydown", this.loadNextRSML, false);
    }

    componentWillUnmount()
    {
        document.removeEventListener("keydown", this.loadNextRSML, false);
    }

    loadNextRSML = e =>
    {
        if (e.key != "ArrowLeft" && e.key != "ArrowRight") return;
        this.setState({path: e.key == "ArrowLeft" ? 
              "C:\\Users\\Andrew\\Desktop\\hkj\\ouptput\\INEW_exp2,128,LN,1225,249" 
            : "C:\\Users\\Andrew\\Desktop\\hkj\\ouptput\\INEW_exp2,207,LN,1137,343"})
    }

    render() 
    {
        return (
            <StyledContainer>
                <TopBar path={this.state.path} />
                <Render path={this.state.path} />
                {/* <RightBar/> */}
            </StyledContainer>
        );
    }
}
