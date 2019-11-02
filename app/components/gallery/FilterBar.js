// @flow
import React, { Component } from 'react';
import styled from 'styled-components';

type Props = {};

export default class FilterBar extends Component<Props> {
  props: Props;
  state = {
    text: "hi"
  }

  shouldComponentUpdate(nextProps, nextState) 
  {
      return this.props.filterText !== nextProps.filterText
   }

  render() {

    const { updateFilterText, filterText } = this.props;

    const StyledSpan = styled.span` && {
      width: 50%;
      margin: auto 0 auto 1em;
    }`
    const clear  = () => updateFilterText("");
    const update = e => updateFilterText(e.target.value);
    console.log(this.state.text)

    return (
      <StyledSpan>
        <div className="input-group">
          <input type="text" className="form-control" value={filterText} onChange={update}/>
          <button className="btn bg-transparent" style={{'margin-left': '-40px', 'z-index': '100'}} onClick={clear}>
            <i className="fa fa-times"></i>
          </button>
          <div className="input-group-append">
            <div className="input-group-text">
              <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="customCheck"/>
                <label className="custom-control-label" htmlFor="customCheck">Analysed</label>
              </div>
            </div>
          </div>
        </div>
      </StyledSpan>
    );
  }
}
