import React, { Component } from 'react';
import { FormGroup, FormControl, Row } from 'react-bootstrap';

type Props = {};

export default class TreeChecklistDropdown extends Component<Props> {

    render() 
    {
        const { name, checked } = this.props;
        return (
            <FormGroup as={Row}>
                <div style={{width: "auto", paddingRight: "2em"}}>{name}</div>
                {checked ? <FormControl as='select'>
                    <option>test1</option>
                    <option>test2</option>
                </FormControl> : ""}
        </FormGroup>
        );
    }
}