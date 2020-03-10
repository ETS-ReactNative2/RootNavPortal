// @flow
import React, { Component } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css'; //CSS doesn't import properly. Obviously. Importing it in global has some effect. Still doesn't work.
import TreeChecklistDropdown from '../containers/gallery/TreeChecklistDropdownContainer';

export default class TreeChecklist extends Component {
    constructor(props) 
    {
        super(props)
        this.state = {
            checked: [],
            expanded: [],
            nodes: []
        }
    }

    componentDidMount() {
        this.reset();
    }    

  // Pass in array of checked paths, get back the paths model in state (if there), otherwise null.
  // Needed because the treechecklist returns lists of strings, but we need lists of objects. 
    getUpdatedCheckedWithModels = checkedStringList => {
        const { checked } = this.props;

        return checkedStringList.map(checkedString => {
            const found = checked.find(test => test.path == checkedString);
            return { path: checkedString, model: found ? found.model : "" };
        });
    }

    reset = () => {
        const { tree, updateChecked, importedFolders } = this.props;
        const paths = tree.map(item => item.path);
        const importedFolderNames = importedFolders.map(it => it.path);

        this.setState({
            checked: paths.concat(importedFolderNames),
            expanded: paths,
            nodes: this.getNodes(tree, paths, importedFolderNames)
        });
        updateChecked(this.getUpdatedCheckedWithModels(paths));
    }

    getNodes = (nodes, checked, importedFolderNames) => 
    {
        if (!nodes) return [];
        return nodes.map((item, i) => {
            const existingFolder = this.props.importedFolders.find(it => it.path == item.path);
            const model = existingFolder ? existingFolder.model : null;
            
            return ({
                value: item.path, 
                children: this.getNodes(item.children, checked, importedFolderNames),
                label: this.getDropdown(item.name, item.path, checked.concat(importedFolderNames), model),
                name: item.name,
                disabled: !!existingFolder,
                model
            })}
        );
    }

    // Smaller version of getNodes that only refreshes the node labels, as they're not components in render and thus don't get changed automatically on rerender.
    refreshNodeLabels = (nodes, checked) => 
    {
        if (!nodes) return [];
        return nodes.map((item, i) => {
            return ({
                ...item,
                label: this.getDropdown(item.name, item.value, checked, item.model),
                children: this.refreshNodeLabels(item.children, checked),
            })
        });
    }

    // Creates the dropdown, with props that determine whether the dropdown should show at all.
    getDropdown = (name, value, checked, model) => <TreeChecklistDropdown name={name} path={value} checked={checked.includes(value)} model={model} />;
  
    render() 
    {
        let { nodes, checked, expanded } = this.state;
        const { updateChecked, importedFolders } = this.props;
        return (
            <div>
                <style>
                { // Hacky CSS because we need to make the inserted dropdowns look good.
                    `span.rct-text label {
                        width: 100%;
                    }
                    span.rct-text .row {
                        margin: 0;
                    }
                    span.rct-title {
                        display: inline-block;
                        width: 70%
                    }
                    span.rct-title .row {
                        width:100%;
                        justify-content: space-between;
                    }
                    span.rct-title select.form-control {
                        width: fit-content;
                        height: fit-content;
                        margin: 0.1em 0;
                        padding: 0.2em;
                    }
                `}
                </style>
                <CheckboxTree
                    nodes={nodes}
                    checked={checked}
                    expanded={expanded}
                    noCascade={true}
                    onCheck={checked => {
                        this.setState({ checked, nodes: this.refreshNodeLabels(nodes, checked.concat(importedFolders.map(it => it.path))) });
                        updateChecked(this.getUpdatedCheckedWithModels(checked));
                    }}
                    checkModel={'all'}
                    onExpand={expanded => this.setState({ expanded })}
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
                />
            </div>
        );
    }
}