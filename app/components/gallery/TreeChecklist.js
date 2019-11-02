// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css'; //CSS doesn't import properly. Obviously. Importing it in global has some effect. Still doesn't work.

type Props = {};

export default class TreeChecklist extends Component<Props> {
  props: Props;

  //I think we'll probably need to sync this with Redux instead, with the some useful value that lets us traverse the tree better in state
  state = {
        checked: [],
        expanded: [],
        rendered: false,
        nodes: []
    };

    render() 
    {
        const getNodes = nodes => 
        {
            if (!nodes) return [];
            return nodes.map((item, i) =>
            {
                return { 
                    value: item.path, 
                    label: item.name,
                    children: getNodes(item.children)
                };
            });
        }

        if (!this.state.rendered) 
        {
            this.state.rendered = true;
            this.state.nodes = getNodes(this.props.tree);
        } 

        return (
        <div>
          <CheckboxTree
            nodes={this.state.nodes}
            checked={this.state.checked}
            expanded={this.state.expanded}
            noCascade={true}
            onCheck={checked => {
            this.setState({ checked });
            this.props.updateChecked(checked);
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


