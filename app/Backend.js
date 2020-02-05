// @flow
import { Component } from 'react';
import { post, get, defaults } from 'axios';
import { API_PATH, API_CHANNEL, matchPathName, _require, INFLIGHT_REQS, API_POLLTIME } from './constants/globals';
import { readFileSync, writeFileSync, createWriteStream } from 'fs';
import mFormData from 'form-data';
import { remote } from 'electron';
import { ipcRenderer } from 'electron';
type Props = {};

//arabidopsis_plate, osr_bluepaper, wheat_bluepaper

export default class Backend extends Component<Props> {
    props: Props;
    queue = [];
    inflightReqs = INFLIGHT_REQS; //Concurrency limit

    constructor(props)
    {
        super(props)
        console.log("hello I am alive");
        defaults.adapter = _require('axios/lib/adapters/http'); //Axios will otherwise default to the XHR adapter due to being in an Electron browser, and won't work.

        ipcRenderer.on(API_CHANNEL, (event, data) => {
            console.log("message received")
            console.log(data)
            this.queue.unshift(...data.paths); //data.paths must be an array
            console.log("Queue is now")
            console.log(this.queue)
        });
        if (remote.getGlobal('API_STATUS')) process.env.API_STATUS = true;
        setInterval(this.sendFile, API_POLLTIME);
    }

    shouldComponentUpdate()
    {
        console.log("trying to update")
        return false; //In theory, backend never needs to update, since it receives everything via IPC, and sends back to Redux when done. 
        //Some collision checking will need to be done in reducer so it doesn't try write over a folder:file that may have been removed
    }

    //Send the job off to the server
    sendFile = () => {
        console.log("polling the queue")

        if (!process.env.API_STATUS || !this.queue.length || !this.inflightReqs) return;
   
        console.log("Sending a file!")
        console.log(this.queue)

        this.inflightReqs--;
        let file = this.queue.shift();
        console.log(file);
        let matchedFile = file.match(/(.+\\|\/)(.+)(\..+)/); //Matches the file path into the absolute directory path, file name and .ext
        const formData = new mFormData();
        const filePath = matchedFile[1] + matchedFile[2] + matchedFile[3];
        console.log(r);

        formData.append('io_rgb', readFileSync(filePath), filePath);
        formData.append('model_id', 3);
        formData.append('io_id', matchedFile[2]);
        formData.append('io_model', 'wheat_bluepaper'); //Hardcoded, change this later when we know where models are getting stored in state
        const config = { headers: formData.getHeaders() };
        console.log(formData)
        console.log(config);

        post(API_PATH + "/job", formData, config).then(res => 
        {
            if (res.data) setTimeout(() => this.pollJob(res.data[0], matchedFile[1] + matchedFile[2]), API_POLLTIME); //absolute path to file, with no ext
        })
        .catch(err => {
            console.log(err);
        });
    }

    pollJob = (jobID, filePath) => {
        console.log("Polling for job: " + jobID + " of file " + filePath)

        get(API_PATH + "/job/" + jobID).then(res => {
            console.log("Data :")
            console.log(res.data)
            if (res.data == 'COMPLETED') this.getOutput(jobID, filePath); 
            else if (res.data == 'PROCESSING' || res.data == 'PENDING') setTimeout(() => this.pollJob(jobID, filePath), API_POLLTIME); 
        })
        .catch(err => console.error(err))
    }

    getOutput = (jobID, filePath) => {
        console.log("retreiving the output")

        let requests = [
            get(API_PATH + "/job/" + jobID + "/output/rsml"),
            get(API_PATH + "/job/" + jobID + "/output/first_order",  {responseType: 'stream'}),
            get(API_PATH + "/job/" + jobID + "/output/second_order", {responseType: 'stream'})
        ]

        Promise.all(requests).then(responses => { //returns an array of the completed responses
            let exts = {};
            
            responses.forEach(res => {
                console.log(res);
                let type = res.config.url.match(/.+\/(.+)/)[1]; //returns rsml or first_order or second_order
                console.log("received, writing for: " + type)

                if (type != 'rsml')
                    res.data.pipe(createWriteStream(filePath + '.' + type + '.png')) //name.first_order.png
                else writeFileSync(filePath + '.rsml', res.data); //sync just for safety here. Maybe not necessary
                exts[type] = true; 
            });
            console.log("sending to redux")
            console.log(exts);
            let matchedPath = matchPathName(filePath); //folder path and filename, no trailing / on the folder
            this.props.updateFile(matchedPath[1], matchedPath[2], exts) //there isn't really any proof checking here :think:
        })
        .catch(err => console.error(err));

        this.inflightReqs++;
    }

    render()
    {
        return ""
    }
}
