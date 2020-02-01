// @flow
import React, { Component } from 'react';
import { StyledFilterBarSpan } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import { InputGroup } from 'react-bootstrap'

type Props = {};

export default class FilterBar extends Component<Props> {
  props: Props;
  constructor(props)
  {
      super(props);
      this.ref = React.createRef();
  }

  typingTimeout = 0;
  typing = false;
  text = "";

  update = e =>
  {
      if (this.typingTimeout) clearTimeout(this.typingTimeout);
      this.text   = e.target.value,
      this.typing = false,
      this.typingTimeout = setTimeout(() => this.props.updateFilterText(this.text), 0);
  }

  render() {
    const { updateFilterText } = this.props;

    const clear  = () => { updateFilterText(""); this.ref.current.value = "" }; 

    return (
      <StyledFilterBarSpan>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text><StyledIcon className={"fas fa-search fa-lg"}/></InputGroup.Text> 
          </InputGroup.Prepend>
          <input key={0} type="text" className="form-control" placeholder="Filter images..." onChange={this.update} ref={this.ref}/>
          <button key={1} className="btn bg-transparent" style={{'marginLeft': '-40px', 'zIndex': '100'}} onClick={clear}>
            <i className="fa fa-times"></i>
          </button>
          <InputGroup.Append>
            <InputGroup.Text>
              <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="analysed"/>
                <label className="custom-control-label" htmlFor="analysed">Analysed</label>
              </div>
            </InputGroup.Text>
          </InputGroup.Append>
        </InputGroup>
      </StyledFilterBarSpan>
    );
  }
}
