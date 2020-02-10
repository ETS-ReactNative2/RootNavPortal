// @flow
import { Component } from 'react';
import { post, get, defaults } from 'axios';
import { IMAGE_EXTS_REGEX, API_PATH, API_ADD, API_DELETE, INFLIGHT_REQS, API_POLLTIME, matchPathName, _require } from './constants/globals';
import { readFileSync, writeFileSync, createWriteStream, unlink, access, constants } from 'fs';
import mFormData from 'form-data';
import { remote } from 'electron';
import { ipcRenderer } from 'electron';
import { sep } from 'path';

type Props = {};

//arabidopsis_plate, osr_bluepaper, wheat_bluepaper
//Clean everything up once models have been added to state and we're not in debugging
export default class Backend extends Component<Props> {
    props: Props;
    queue = [];
    inflightReqs = INFLIGHT_REQS; //Concurrency limit
    inFlightFiles = {}; //Tracks requests with some data in case we need to ignore the response. { C:\path\file: {model: 'wheat_bluepaper', ext: '.png' }, ... }

    constructor(props)
    {
        super(props)
        defaults.adapter = _require('axios/lib/adapters/http'); //Axios will otherwise default to the XHR adapter due to being in an Electron browser, and won't work.

        ipcRenderer.on(API_ADD, (event, data) => {
            this.queue.push(...data.paths); //data.paths must be an array
        });

        //A single directory path {path: ""}
        ipcRenderer.on(API_DELETE, (event, data) => {
            this.handleDelete(data.path);
        });

        if (remote.getGlobal('API_STATUS')) process.env.API_STATUS = true;
        setInterval(this.sendFile, API_POLLTIME);
    }

    shouldComponentUpdate()
    {
        return false; //In theory, backend never needs to update, since it receives everything via IPC, and sends back to Redux when done. 
        //Some collision checking will need to be done in reducer so it doesn't try write over a folder:file that may have been removed
        //This theory is in caution of updating stopping functions and resetting some component vars like the queue. Props still get updated
    }

    
    //Iterate over state and for each file in the folder, delete the relevant files denoted by existing keys, and add to queue
    //A new object is constructed to be sent to Redux to completely write over that folder. It should contain everything already present bar segmasks and rsml exts
    handleDelete = path => {
        const { files, resetFolder } = this.props;
        let newState = {}; //This will need to have an object for each file with the remaining extensions + thumbnails/removed extensions
        Object.keys(files[path]).forEach(fileName => {
            newState[fileName] = {}; //Init new folder object
            let queued = false; //Only allow file to be requeued once - else each seg mask/rsml will trigger it
            Object.keys(files[path][fileName]).forEach(extension => { //For each extension in the state object
                
                if (extension.match(/first_order|second_order|rsml/)) //If it's an API file
                {
                    access(path + sep + fileName + "." + (extension != 'rsml' ? extension + ".png" : extension), constants.F_OK, err => { //Does it exist?
                        if (!err)
                        {
                            unlink(path + sep + fileName + "." + (extension != 'rsml' ? extension + ".png" : extension), err => {
                                if (err) console.error(err);
                            });
                            if (!queued) this.queue.push(path + sep + fileName + "." + Object.keys(files[path][fileName]).find(ext => ext.match(IMAGE_EXTS_REGEX))); //Readd it to the queue
                            queued = true;
                        }
                    });
                }
                else newState[fileName][extension] = files[path][fileName][extension]; //Otherwise copy the value for that ext to our reset state
            });
        });
         //This has been correct for my tests, but that's just with 3 files, unsure if it will stay sync with a big dataset - test later!;
        resetFolder(path, newState);
    }

    //Send the job off to the server
    sendFile = () => {
        if (!process.env.API_STATUS || !this.queue.length || !this.inflightReqs) return;

        this.inflightReqs--; //Kind of like a semaphore, limits how many jobs we can start at once
        let file = this.queue.shift();
        let matchedFile = file.match(/(.+\\|\/)(.+)(\..+)/); //Matches the file path into the absolute directory path, file name and .ext
        const formData = new mFormData();
        const filePath = matchedFile[1] + matchedFile[2] + matchedFile[3];

        formData.append('io_rgb', readFileSync(filePath), filePath);
        formData.append('model_id', 3);
        formData.append('io_id', matchedFile[2]);
        formData.append('io_model', 'wheat_bluepaper'); //Hardcoded, change this later when we know where models are getting stored in state
        const config = { headers: formData.getHeaders() };

         //Add file to inflight object with the model it's been processed with, and its ext, so we can requeue later if needed
        this.inFlightFiles[matchedFile[1] + matchedFile[2]] = { model: "wheat_bluepaper", ext: matchedFile[3] }; //model: this.props.files[matchedFile[1]].attr.model;
        post(API_PATH + "/job", formData, config).then(res => 
        {
            if (res.data) setTimeout(() => this.pollJob(res.data[0], matchedFile[1] + matchedFile[2]), API_POLLTIME); //absolute path to file, with no ext
        })
        .catch(err => {
            console.error(err);
        });
    }

    pollJob = (jobID, filePath) => {

        get(API_PATH + "/job/" + jobID).then(res => {
            if (res.data == 'COMPLETED') this.getOutput(jobID, filePath); 
            else if (res.data == 'PROCESSING' || res.data == 'PENDING') setTimeout(() => this.pollJob(jobID, filePath), API_POLLTIME); 
        })
        .catch(err => console.error(err))
    }

    getOutput = (jobID, filePath) => {

        let requests = [
            get(API_PATH + "/job/" + jobID + "/output/rsml"),
            get(API_PATH + "/job/" + jobID + "/output/first_order",  {responseType: 'stream'}),
            get(API_PATH + "/job/" + jobID + "/output/second_order", {responseType: 'stream'})
        ]

        Promise.all(requests).then(responses => { //returns an array of the completed responses once they've all finished
            let exts = {};
            let matchedPath = matchPathName(filePath);
            //if (this.inFlightFiles[filePath].model != this.props.files[matchedPath[1]].attr.model) //this.props.files[matchedPath[1]].attr.model //Has the model changed in state since we posted the request? Then ignore and requeue
            //    this.queue.push(matchedPath[1] + sep + matchedPath[2] + this.inFlightFiles[filePath].ext); //Readd to queue

            responses.forEach(res => {
                //if (this.inFlightFiles[filePath].model != this.props.files[matchedPath[1]].attr.model) return; //Ignore if model has changed, write nothing back 
                 //If the model has changed, write nothing;
                let type = res.config.url.match(/.+\/(.+)/)[1]; //returns rsml or first_order or second_order

                if (type != 'rsml')
                    res.data.pipe(createWriteStream(filePath + '.' + type + '.png')) //name.first_order.png
                else writeFileSync(filePath + '.rsml', res.data); //sync just for safety here. Maybe not necessary
                exts[type] = true; 
            });
            delete this.inFlightFiles[filePath]; //Remove from inflight data
                         //folder path and filename, no trailing / on the folder
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
