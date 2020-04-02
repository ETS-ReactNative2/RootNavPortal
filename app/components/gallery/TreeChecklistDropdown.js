import React, { Component } from 'react';
import { FormGroup, FormControl, Row } from 'react-bootstrap';

export default class TreeChecklistDropdown extends Component {
    render() 
    {
        const { name, path, checked, updateChecklistDropdown, model, apiModels } = this.props;
        return (
            <FormGroup as={Row}>
                <div style={{width: "auto", paddingRight: "8em"}}>
                    <span title={path}>
                        {name}
                    </span>
                </div>
                {checked ? 
                    <FormControl defaultValue={model} as='select' onChange={e => updateChecklistDropdown(path, e.target.value)} disabled={model || model == ""}>
                        <option value={''}>Select Model</option>
                        { apiModels.map(model => <option key={model.value} value={model.value}>{model.description}</option>) }
                    </FormControl> 
                    : ""}
            </FormGroup>
        );
    }
}