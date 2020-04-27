import React, { Component } from 'react';
import { FormGroup, FormControl, Row } from 'react-bootstrap';

export default class TreeChecklistDropdown extends Component {
    render() 
    {
        const { name, path, checked, updateFolderModels, model, apiModels, folders } = this.props;
        const disabled = folders.find(it => it.path == path);
        return (
            <FormGroup as={Row}>
                <div style={{width: "auto", paddingRight: "8em"}}>
                    <span title={path}>
                        {name}
                    </span>
                </div>
                {checked ? 
                    <FormControl value={model} as='select' onChange={e => updateFolderModels(path, e.target.value)} disabled={disabled}>
                        <option value={''}>Select Model</option>
                        { apiModels.map(model => <option key={model.value} value={model.value}>{model.description}</option>) }
                    </FormControl> 
                    : ""}
            </FormGroup>
        );
    }
}