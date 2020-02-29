import React, { Component } from 'react';
import { matchPathName } from '../../constants/globals';
import CheckboxTree from 'react-checkbox-tree'

export default class FolderChecklist extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: [],
            expanded: [],
            nodes: []
        }
    }

    componentDidMount() {
        this.reset();
    }   

    reset = () => {
        const tree = this.folderListToTree(this.props.folders.map(it => it.path));
        const paths = tree.map(item => item.value);
        this.setState({
          checked: paths,
          expanded: paths,
          nodes: tree
        });
    
    }

    // Converts a flat list of foldername strings into a hierarchical object representing folder structure
    folderListToTree = list => {
        let tree = [];
        list.forEach(path => {
            tree = this.addToChildren(path, tree)
        });
        return tree;
    }

    addToChildren = (path, children) => {
        let nodeIndex = children.findIndex(childNode => path.includes(childNode.value));
        if (nodeIndex != -1) children[nodeIndex].children = this.addToChildren(path, children[nodeIndex].children)
        else {
            const name = matchPathName(path)[2];
            children.push({ value: path, children: [], label: name });
        }
        return children;
    }

    render() {
        let { nodes, checked, expanded } = this.state;
        let { updateChecked } = this.props;
        return (
            <CheckboxTree
                nodes={nodes}
                checked={checked}
                expanded={expanded}
                checkModel={'all'}
                icons={{
                    check: <i className="far fa-check-square"/>,
                    uncheck: <i className="far fa-square"/>,
                    halfCheck: <i className="far fa-minus-square"/>,
                    expandClose: <i className="fas fa-chevron-right"/>,
                    expandOpen: <i className="fas fa-chevron-down"/>,
                    expandAll: <i className="fas fa-plus-square"/>,
                    collapseAll: <i className="fas fa-minus-square"/>,
                    parentClose: <i className="far fa-folder"/>,
                    parentOpen: <i className="far fa-folder-open"/>,
                    leaf: <i className="far fa-folder"/>,
                }}
                showExpandAll={true}
                onCheck={checked => { 
                    this.setState({ checked })
                    updateChecked(checked);
                }} 
                onExpand={expanded => this.setState({ expanded })}
        
            />
        );
    }
}