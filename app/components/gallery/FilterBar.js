// @flow
import React, { Component } from 'react';
import { StyledFilterBarSpan } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import { InputGroup } from 'react-bootstrap'

type Props = {};

export default class FilterBar extends Component<Props> {
  props: Props;
  typingTimeout = 0;
  text = "";

  constructor(props)
  {
    super(props);
    this.textref = React.createRef();
    this.checkboxref = React.createRef();
  }

  componentDidMount() 
  {
    this.clear();
  }


  updateFilterText = e =>
  {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.text   = e.target.value,
    this.typingTimeout = setTimeout(() => this.props.updateFilterText(this.text), 0);
  }

  updateFilterAnalysed = e =>
  {
    this.props.updateFilterAnalysed(e.target.checked);
  }



  clear = () => { 
    this.props.updateFilterText(""); 
    this.textref.current.value = ""; 
    this.props.updateFilterAnalysed(false);
    this.checkboxref.current.checked = false;
   }; 

  render() {
    return (
      <StyledFilterBarSpan>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text><StyledIcon className={"fas fa-search fa-lg"}/></InputGroup.Text> 
          </InputGroup.Prepend>
          <input key={0} type="text" className="form-control" placeholder="Filter images..." onChange={this.updateFilterText} ref={this.textref}/>
          <button key={1} className="btn bg-transparent" style={{'marginLeft': '-40px', 'zIndex': '100'}} onClick={this.clear}>
            <i className="fa fa-times"></i>
          </button>
          <InputGroup.Append>
            <InputGroup.Text>
              <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="analysed" onClick={this.updateFilterAnalysed} ref={this.checkboxref}/>
                <label className="custom-control-label" htmlFor="analysed">Analysed</label>
              </div>
            </InputGroup.Text>
          </InputGroup.Append>
        </InputGroup>
      </StyledFilterBarSpan>
    );
  }
}
