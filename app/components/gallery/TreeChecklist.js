// @flow
import React, { Component } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css'; //CSS doesn't import properly. Obviously. Importing it in global has some effect. Still doesn't work.
import TreeChecklistDropdown from '../containers/gallery/TreeChecklistDropdownContainer';
type Props = {};

export default class TreeChecklist extends Component<Props> {
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
    const { checked } = this.state;
    return checkedStringList.map(checkedString => {
      const model = checked.find(test => test.path == checkedString) || "";
      return { path: checkedString, model };
    });
  }

  reset = () => {
    const { tree, updateChecked } = this.props;
    const paths = tree.map(item => item.path);
    this.setState({
      checked: paths,
      expanded: paths,
      nodes: this.getNodes(tree, paths)
    });
    updateChecked(this.getUpdatedCheckedWithModels(paths));
  }

  getNodes = (nodes, checked) => 
  {
    if (!nodes) return [];
    return nodes.map((item, i) => 
      ({ 
        value: item.path, 
        children: this.getNodes(item.children, checked),
        label: this.getDropdown(item.name, item.path, checked),
        name: item.name,
      })
    );
  }

  // Smaller version of getNodes that only refreshes the node labels, as they're not components in render and thus don't get changed automatically on rerender.
  refreshNodeLabels = (nodes, checked) => 
  {
    if (!nodes) return [];
    return nodes.map((item, i) => 
      ({
        ...item,
        label: this.getDropdown(item.name, item.value, checked),
        children: this.refreshNodeLabels(item.children, checked),
      })
    );
  }

  // Creates the dropdown, with props that determine whether the dropdown should show at all.
  getDropdown = (name, value, checked) => <TreeChecklistDropdown name={name} checked={checked.includes(value)} />;
  
  render() 
  {
    let { nodes, checked, expanded } = this.state;
    const { updateChecked } = this.props;
    return (
      <div>
        <style>
        { // Hacky CSS because we need to make the inserted dropdowns look good.
        ` span.rct-text label {
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
            this.setState({ checked, nodes: this.refreshNodeLabels(nodes, checked) });
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