import React, { Component } from 'react';
import { FormGroup, FormControl, Row } from 'react-bootstrap';
import { API_MODELS } from '../../constants/globals'
type Props = {};

export default class TreeChecklistDropdown extends Component<Props> {

    // Todo make another props function to update the model onChange.
    // Note the value needs to be empty string to detect a non-selection, so might need to manipulate that in redux?

    render() 
    {
        const { name, checked, updateChecklistDropdown } = this.props;
        return (
            <FormGroup as={Row}>
                <div style={{width: "auto", paddingRight: "2em"}}>{name}</div>
                {checked ? <FormControl as='select' onChange={e => updateChecklistDropdown(name, e.target.value)}>
                    <option value={''}>Select Model</option>
                    { API_MODELS.map(model => <option key={model.apiName} value={model.apiName}>{model.displayName}</option>) }
                </FormControl> : ""}
        </FormGroup>
        );
    }
}