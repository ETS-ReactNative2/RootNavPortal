import React, { Component, createRef } from 'react';
import { Card, Row, InputGroup } from 'react-bootstrap';
import { matchPathName } from '../../constants/globals';
import CheckboxTree from 'react-checkbox-tree'
import { StyledCard, StyledRedI } from './StyledComponents'
import TooltipOverlay from '../common/TooltipOverlay';
import { StyledIcon } from '../CommonStyledComponents';
import styled from 'styled-components';

export default class FolderChecklist extends Component {
    typingTimeout = 0;
    text = "";

    StyledInput = styled.input`
        border-radius: 0;
    `;

    StyledInputGroupText = styled(InputGroup.Text)`
        border-radius: 0;
    `;

    constructor(props) {
        super(props);
        this.state = {
            checked: props.path ? [props.path] : [],
            expanded: [],
            nodes: []
        };
        this.textref = createRef();
        this.checkboxref = createRef();
    }

    reset = () => {
        console.log("reset");
        const { folders, files } = this.props;
        const folderPaths = folders.map(it => it.path).sort().filter(it => Object.keys(files).includes(it) && Object.values(files[it]).some(file => file.parsedRSML));
        const tree = this.folderListToTree(folderPaths);
        const { checked, expanded } = this.state;
        this.setState({
          checked: checked.filter(it => folderPaths.includes(it)),
          expanded: expanded.length != 0 ? expanded.filter(it => folderPaths.includes(it)) : this.getDefaultExpanded(tree, folderPaths, checked),
          nodes: tree
        });
    };

    getDefaultExpanded = (tree, folderPaths, startingChecked) => {
        return folderPaths.filter(path => startingChecked.some(checked => checked.includes(path))).concat(tree.map(item => item.value));
    };

    // Converts a flat list of foldername strings into a hierarchical object representing folder structure
    folderListToTree = list => {
        let tree = [];
        list.forEach(path => {
            tree = this.addToChildren(path, tree)
        });
        return tree;
    };

    addToChildren = (path, children) => {
        let nodeIndex = children.findIndex(childNode => path.includes(childNode.value));
        if (nodeIndex != -1) children[nodeIndex].children = this.addToChildren(path, children[nodeIndex].children);
        else {
            const name = matchPathName(path).fileName;
            const filterTextNumIcon = this.props.filterText ? this.getNumberedIcon(this.filteredFileCount(path)) : <></>;

            const style = path == this.props.path ? { padding: "2px 7px", background: "rgba(51, 51, 204, 0.3)", borderRadius: "5px", "&:hover": {background: "white"}} : {};
            children.push({ value: path, children: [], label: <span style={style} title={path}>{name}{filterTextNumIcon}</span> });
        }
        return children;
    };

    cascadeChecked = (checked, clicked) => {
        return checked.includes(clicked.value) ? checked.concat(this.flattenChildren(clicked.children)) : checked;
    };

    flattenChildren = children => {
        return children.map(child => this.flattenChildren(child.children).concat(child.value)).flat();
    };

    componentDidMount() {
        this.reset();
        this.props.updateChecked(this.state.checked);
        if (this.props.filterText) 
        Array.from(document.getElementsByClassName("rct-node-clickable"))
            .forEach(element => element.style.width = "-webkit-fill-available");
    }   

    componentDidUpdate(prevProps) {
        const folderPaths = this.props.folders.map(it => it.path);
        const oldFolderPaths = prevProps.folders.map(it => it.path);
        if (folderPaths.length != oldFolderPaths.length 
            || prevProps.path != this.props.path 
            || this.checkNewRSML(prevProps.files) 
            || prevProps.filterText != this.props.filterText
        ) this.reset();
        if (this.props.filterText) 
            Array.from(document.getElementsByClassName("rct-node-clickable"))
                .forEach(element => element.style.width = "-webkit-fill-available");
    }

    checkNewRSML = oldFiles => {
        const { files } = this.props;
        let folders = Object.keys(files);
        for (let i = 0; i < folders.length; i++)
        {
            let fileObj = files[folders[i]];
            let fileNames = Object.keys(fileObj);
            for (let j = 0; j < fileNames.length; j++)
            {
                if (files[folders[i]][fileNames[j]].parsedRSML)
                {
                    if (!oldFiles[folders[i]] || !oldFiles[folders[i]][fileNames[j]] || !oldFiles[folders[i]][fileNames[j]].parsedRSML) return true;
                    //If new RSML has appeared in a folder/file, update.
                }
            }
        }
        return false;
    };

    filteredFileCount = path => {
        return Object.keys(this.props.files[path]).reduce((acc, fileName) => acc += fileName.toLowerCase().includes(this.props.filterText), 0) 
    };

    updateFilterText = e =>
    {
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.text = e.target.value,
        this.typingTimeout = setTimeout(() => {
            this.props.updateViewerFilter(this.text.toLowerCase());
        }, 200);
    };

    getNumberedIcon = num => (<TooltipOverlay component={ props => <div style={{fontSize: "0.65em", float: "right"}}className="fa-stack fa-sm" {...props}>
            <span className={`far fa-circle fa-stack-2x`} />
            <span style={{fontSize: "1.3em"}} className="fa-stack-1x">{num}</span>
        </div>} 
        text={`There are ${num} files in this folder that will be measured`}
        placement={"top"}
    />)

    clear = () => { 
        this.props.updateViewerFilter(""); 
        this.textref.current.value = ""; 
        this.checkboxref.current.checked = false;
    }; 

    render() {
        const { nodes, checked, expanded } = this.state;
        const { updateChecked, updatePath, redFolderBorder, redFilterBorder } = this.props;
        return (
            <StyledCard redborder={redFolderBorder ? 1 : 0} style={{ borderRadius: '0 .25rem 0 0', marginRight: "0.5em" }}>
                <Card.Header style={{ paddingTop: '0.5em', paddingBottom: '0.5em',  borderBottom: "0" }}>
                    <Row>
                        <div className="col-11">
                            <b>Select folders to measure</b>
                        </div>
                        <div style={{position: "absolute", right: "0.5em"}}>
                            <TooltipOverlay component={ props => <StyledIcon
                                    className={`fas fa-info-circle`} 
                                    {...props}
                                />} 
                                text={"Check a folder to add it to be measured. Click on a folder name to switch between open folders (highlighted). "}
                                placement={"top"}
                            />
                        </div>
                    </Row> 
                </Card.Header>
                <Card.Header style={{ padding: 0, borderBottom: "0"  }}>
                    <InputGroup style={redFilterBorder ? { boxShadow: '0 0 10px red' } : {}}>
                        <this.StyledInput key={0} type="text" className="form-control" placeholder="Filter images..." onChange={this.updateFilterText} ref={this.textref}/>
                        <button key={1} className="btn bg-transparent" style={{'marginLeft': '-40px', 'zIndex': '100'}} onClick={this.clear}>
                            <i className="fa fa-times"></i>
                        </button>
                        <InputGroup.Append>
                            <this.StyledInputGroupText>
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="any" onClick={() => {}} ref={this.checkboxref}/>
                                    <label className="custom-control-label" htmlFor="any">Any</label>
                                </div>
                            </this.StyledInputGroupText>
                        </InputGroup.Append>
                    </InputGroup>
                </Card.Header>
                <div style={{ padding: '0.5em' }}><CheckboxTree
                    noCascade={true}
                    nodes={nodes}
                    checked={checked}
                    expanded={expanded}
                    checkModel={'all'}
                    icons={{
                        check: <i className="far fa-check-square"/>,
                        uncheck: <StyledRedI redborder={redFolderBorder ? 1 : 0} className="far fa-square"/>,
                        halfCheck: <i className="far fa-minus-square"/>,
                        expandClose: <i className="fas fa-chevron-right"/>,
                        expandOpen: <i className="fas fa-chevron-down"/>,
                        expandAll: <i className="fas fa-plus-square"/>,
                        collapseAll: <i className="fas fa-minus-square"/>,
                        parentClose: <i className="far fa-folder"/>,
                        parentOpen: <i className="far fa-folder-open"/>,
                        leaf: <i className="far fa-folder"/>,
                    }}
                    onCheck={(rawChecked, clicked) => { 
                        const checked = this.cascadeChecked(rawChecked, clicked);
                        this.setState({ checked })
                        updateChecked(checked);
                    }} 
                    onClick={node => { if (node.value != this.props.path) updatePath(node.value) }}
                    onExpand={expanded => this.setState({ expanded })}
                /></div>
            </StyledCard>
        );
    }
}