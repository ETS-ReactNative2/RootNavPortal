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
    };

  render() {
    const { tree } = this.props;
    console.log(this.props);

    const getNodes = (nodes) => {
        if (!nodes) return [];
        return nodes.map((item, i) => {
            return { 
                value: item.name, 
                label: item.name,
                children: getNodes(item.children)
            }
        })
    }

    let nodes = getNodes(tree);

    return (
      <div>
        {
            //This is a nice styled bootstrap checkbox that should go over the anaylsed one but it doesn't work there for some reason
            /* <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="customCheck1" />
            </div> */
        }
          <CheckboxTree
            nodes={nodes}
            checked={this.state.checked}
            expanded={this.state.expanded}
            onCheck={checked => this.setState({ checked })}
            onExpand={expanded => this.setState({ expanded })}
        />
      </div>
    );
  }
}


