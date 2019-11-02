import React from 'react';
import moment from 'moment';

import styles from './DateRange.scss'; //This doesn't work because css is fucked
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';

export default class DateRange extends React.Component {

  constructor(props) 
  {
    //Placeholder state for Redux
    super(props);
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange   = this.handleToChange.bind(this);
    this.state = {
      from: undefined,
      to: undefined,
    };
  }
 

  showFromMonth() 
  {
    const { from, to } = this.state;
    if (!from) return;

    if (moment(to).diff(moment(from), 'months') < 2)
      this.to.getDayPicker().showMonth(from);
  }

  //State handlers, replace with Redux later
  handleFromChange(from) { this.setState({ from }); }
  handleToChange(to) { this.setState({ to }, this.showFromMonth); }

  render()
  {
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };

    return (
      <span className={`${styles.DatePickerForm} InputFromTo`} style={{'display':'inline-flex', 'margin': 'auto 0.5em auto 2em'}}>
        <DayPickerInput
          value={from}
          placeholder="From"
          format="L"
          formatDate={formatDate}
          parseDate={parseDate}
          dayPickerProps={{
            selectedDays: [from, { from, to }],
            disabledDays: { after: to },
            toMonth: to,
            modifiers,
            numberOfMonths: 2,
            onDayClick: () => this.to.getInput().focus(),
          }}
          onDayChange={this.handleFromChange}
        />
        <div style={{'padding':'0 5px', 'textAlign':'center', 'margin': 'auto 0px'}}>—</div>
        <span className={`${styles.DatePickerForm} InputFromTo-to`}>
          <DayPickerInput
            ref={el => (this.to = el)}
            value={to}
            placeholder="To"
            format="L"
            formatDate={formatDate}
            parseDate={parseDate}
            dayPickerProps={{
              selectedDays: [from, { from, to }],
              disabledDays: { before: from },
              modifiers,
              month: from,
              fromMonth: from,
              numberOfMonths: 2,
            }}
            onDayChange={this.handleToChange}
          />
        </span>
          <style> 
          {`
            .InputFromTo .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
                background-color: #f0f8ff !important;
                color: #4a90e2;
            }
            .InputFromTo .DayPicker-Day {
                border-radius: 0 !important;
            }
            .InputFromTo .DayPicker-Day--start {
                border-top-left-radius: 50% !important;
                border-bottom-left-radius: 50% !important;
            }
            .InputFromTo .DayPicker-Day--end {
                border-top-right-radius: 50% !important;
                border-bottom-right-radius: 50% !important;
            }
            .InputFromTo .DayPickerInput-Overlay {
                width: 550px;
            }
            .InputFromTo-to .DayPickerInput-Overlay {
                margin-left: -198px;
            }
            .DayPicker-Caption {
                display: table-caption;
                margin-bottom: 0.5em;
                padding: 0 0.5em;
                text-align: left;
                color: black;
            }
            .DayPicker-Caption > div {
                font-weight: 500;
                font-size: 1.15em;
                color: black;
            }
            .DayPicker-Day {
                display: table-cell;
                padding: 0.5em;
                border-radius: 50%;
                vertical-align: middle;
                text-align: center;
                cursor: pointer;
                color: black;
            }
            .DayPicker-Day--today {
                color: #D0021B;
                font-weight: 700;
              }
        `}
        </style>
      </span>
    );
  }
}