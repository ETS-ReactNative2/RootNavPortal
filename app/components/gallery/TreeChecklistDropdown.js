import React, { Component } from 'react';
import { FormGroup, FormControl, Row } from 'react-bootstrap';
import { API_MODELS } from '../../constants/globals'

export default class TreeChecklistDropdown extends Component {
    render() 
    {
        const { name, path, checked, updateChecklistDropdown, model } = this.props;
        return (
            <FormGroup as={Row}>
                <div style={{width: "auto", paddingRight: "2em"}}><span title={path}>{name}</span></div>
                {checked ? <FormControl defaultValue={model}  as='select' onChange={e => updateChecklistDropdown(path, e.target.value)} disabled={model || model==""}>
                    <option value={''}>Select Model</option>
                    { API_MODELS.map(model => <option key={model.apiName} value={model.apiName}>{model.displayName}</option>) }
                </FormControl> : ""}
        </FormGroup>
        );
    }
}