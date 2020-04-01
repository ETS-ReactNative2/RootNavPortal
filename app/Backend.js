// @flow
import { Component } from 'react';
import { post, get, defaults } from 'axios';
import { IMAGE_EXTS_REGEX, API_DELETE, API_PARSE, API_THUMB, INFLIGHT_REQS, API_POLLTIME, matchPathName, _require, xmlOptions, THUMB_PERCENTAGE } from './constants/globals';
import { readFileSync, writeFileSync, createWriteStream, unlink, access, constants, existsSync } from 'fs';
import mFormData from 'form-data';
import { ipcRenderer } from 'electron';
import { sep } from 'path';
import parser from 'xml2json';
import imageThumbail from 'image-thumbnail';

//arabidopsis_plate, osr_bluepaper, wheat_bluepaper
//Clean everything up once models have been added to state and we're not in debugging
export default class Backend extends Component {
    queue = [];
    inflightReqs = INFLIGHT_REQS; //Concurrency limit
    rootNavModel = -1; //HMR seems to break queues and class vars.

    //this.props.inflightfiles : Tracks requests with some data in case we need to ignore the response. { C:\path\file: {model: 'wheat_bluepaper', ext: '.png' }, ... }

    constructor(props)
    {
        super(props)
        defaults.adapter = _require('axios/lib/adapters/http'); //Axios will otherwise default to the XHR adapter due to being in an Electron browser, and won't work.

        //A single directory path {path: ""}
        ipcRenderer.on(API_DELETE, (event, data) => {
            this.handleDelete(data.path);
        });

        ipcRenderer.on(API_PARSE, (event, data) => {
            data.forEach(path => this.parseRSML(path));
        });

        ipcRenderer.on(API_THUMB, (event, data) => {
            data.forEach(args => this.genThumbnail(args.folder, args.file, args.fileName));
        });

        setInterval(this.sendFile, API_POLLTIME);
    }

    //This is called on any file addition, or API update. No IPC is used anymore for queueing files. Even if backend late loads, we should still just pick up all the missed ones
    //On any next iteration. There is a minor risk that if all files are added, and no more get added, and no API settings change, it won't add them to the queue. Very small edge case
    //And the user can always reanalyse anyway. We could make the refresh button also trigger a full scan manually too.
    scanFiles = () => {
        let apiFiles = []; //search through the file structure for anything imported without RSML
        const { files, addQueue, inflightFiles } = this.props;

        Object.keys(files).forEach(folder => Object.keys(files[folder]).forEach(file => {
            if (!files[folder][file].rsml)
            {
                let imageExt = Object.keys(files[folder][file]).find(ext => ext.match(IMAGE_EXTS_REGEX));
                let filePath = folder + sep + file + "." + imageExt;

                const { path, fileName } = this.matchFileParts(filePath); //Get the exact same path used for inflightFiles just in case anything differs
                if (imageExt && this.queue.indexOf(filePath) == -1 && !inflightFiles[path + fileName]) apiFiles.push(filePath); //Only if it's not already queued/inflight -> maybe API got updated when it was already up
            }
        }));
        if (apiFiles.length && this.props.apiStatus) //cautiously adding this here so queue doesn't get updated if there's no connection. Any API config change will rescan
        {
            this.queue.push(...apiFiles);
            addQueue(apiFiles);
        }
    };

    componentDidUpdate(prevProps)
    {  
        //This will fire once the config gets imported by the gallery, initialising the API values. Only then can we poll for status.
        if ((prevProps.apiAddress != this.props.apiAddress) || (this.props.apiKey != prevProps.apiKey)) //On settings change, poll the API and add missing files to queue if it's up
        {
            const { apiAddress, apiKey, updateAPIStatus, updateAPIModels, updateAPIAuth } = this.props;
            defaults.headers.common['X-Auth-Token'] = apiKey; //Set the default header for every request.

            get(apiAddress + "/model").then(res => { 
                updateAPIAuth(true);
                this.rootNavModel = -1;
                res.data.forEach(model => model.jsonModelName.includes("rootnav2") ? this.rootNavModel = model.modelId : {});
                if (this.rootNavModel == -1) updateAPIAuth(false); //If the user has no RN2 model, we say the API key is invalid.

                else get(apiAddress + "/model/" + this.rootNavModel).then(res => { //Otherwise go fetch the RN2 input models, and report all good
                    updateAPIModels(res.data.inputs[1].accepted_values);
                    updateAPIStatus(true);
                    this.scanFiles();
                }).catch(err => console.error(err));
            }).catch(err => { 
                console.log(err);
                if (err.message.includes("401")) 
                    updateAPIAuth(false); //If we get a 401, explicitly set in Redux that we did so the indicator can relay an error regarding the token
                updateAPIStatus(false); 
            });
        }

        //If the number of files in the new files array is larger than the amount of files we have, scan through and check for new ones lacking RSML
        if (Object.values(this.props.files).reduce((acc, value) => acc += Object.keys(value).length, 0) > Object.values(prevProps.files).reduce((acc, value) => acc += Object.keys(value).length, 0)) 
            this.scanFiles(); //If files changes, scan it for queueing.
    }

    genThumbnail = (folder, file, fileName) => {
        const ext = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));

        imageThumbail.thumb(folder + sep + fileName + "." + ext, { percentage: THUMB_PERCENTAGE, pngOptions: { force: true } }).then(thumb => 
        {
            this.props.addThumb(folder, fileName, { ext, thumb }) //Bundle the thumbnail with the extension so we can label them pngThumb or similar accordingly in case there are multiple thumbs for a file name
        }).catch(err => console.error(err));
    };

    parseRSML = filePath => {
        const { path, fileName } = matchPathName(filePath);
        //Ingest the RSML here if it's not cached in state
        this.structurePolylines(path, fileName, readFileSync(path + sep + fileName + ".rsml", 'utf8'));
    };

    structurePolylines = (path, fileName, rsml) => {
        //Ingest the RSML here if it's not cached in state
        let polylines = [];
        let rsmlJson = parser.toJson(rsml, xmlOptions);

        let plant = rsmlJson.rsml[0].scene[0].plant; 
        plant.forEach(plantItem => this.formatPoints(plantItem, plantItem.id, polylines));
        this.props.updateParsedRSML(path, fileName, { rsmlJson, polylines }); //Send it to state, with {JSONParsedXML, and simplifiedPoints}
    };
    
    formatPoints = (rsml, plantID, polylines) => {
        if (rsml.geometry) //If the node has geometry, extract it into an array of simplified points
        {
            // polylines: [ {type: "lat", id: "5.3", points: [{x, y}] }]
            polylines.push({ //To test alts, change rootnavspline to polyline
                type: rsml.label,
                id: plantID + "-" + rsml.id, //This structure may not be useful for plugins, so they might need to do organising of RSML themselves
                points: rsml.geometry[0].polyline[0].point.map(p => ({ 
                    x: parseFloat(p.x), //Floats still need to be transformed so Fabric can draw them right => but only in the line array, these never end up in the RSML/JSON
                    y: parseFloat(p.y)
                })) //Can also add a * 0.5 to scale the image points down, rather than scaling the canvas
            });
        }
        if (rsml.root)
        {
           rsml.root.forEach(root => this.formatPoints(root, plantID, polylines));
        }
    };
    
    //Iterate over state and for each file in the folder, delete the relevant files denoted by existing keys, and add to queue
    //A new object is constructed to be sent to Redux to completely write over that folder. It should contain everything already present bar segmasks and rsml exts
    handleDelete = path => {
        const { files, resetFolder, addQueue, inflightFiles } = this.props;
        let newState = {}; //This will need to have an object for each file with the remaining extensions + thumbnails/removed extensions
        let queuedFiles = [];

        if (!files[path] || !Object.keys(files[path]).length) return;
        Object.keys(files[path]).forEach(fileName => {
            newState[fileName] = {}; //Init new folder object
            let queued = false; //Only allow file to be requeued once - else each seg mask/rsml will trigger it
            Object.keys(files[path][fileName]).forEach(extension => { //For each extension in the state object
                
                if (extension == 'parsedRSML') return; //Get rid of the existing parsed polylines and JSON RSML
                if (extension.match(/_C1|_C2|rsml/)) //If it's an API file
                {
                    access(path + sep + fileName + (extension != 'rsml' ? extension + ".png" : '.' + extension), constants.F_OK, err => { //Does it exist?
                        if (!err)
                        {
                            unlink(path + sep + fileName + (extension != 'rsml' ? extension + ".png" : '.' + extension), err => {
                                if (err) console.error(err);
                            });
                        }
                        else console.error(err);
                    });
                }
                else newState[fileName][extension] = files[path][fileName][extension]; //Otherwise copy the value for that ext to our reset state

                if (!queued && !inflightFiles[path + sep + fileName]) //If the file is inflight, don't queue, since model detection/requeueing is done on job receiving
                {
                    let file = path + sep + fileName + "." + Object.keys(files[path][fileName]).find(ext => ext.match(IMAGE_EXTS_REGEX));
                    this.queue.push(file); //Readd it to the queue
                    queuedFiles.push(file); //No extension in the state queue, figured it would make it easier to keep track of things if we don't require the extension to find it
                } 
                queued = true;
            });
        });
         //This has been correct for my tests, but that's just with 3 files, unsure if it will stay sync with a big dataset - test later!;
        resetFolder(path, newState);
        addQueue(queuedFiles);
    };

    //Send the job off to the server
    sendFile = () => {
        if (!this.props.apiStatus || !this.queue.length || !this.inflightReqs || !this.props.apiAuth || this.rootNavModel < 0) return;
        const { removeQueue, folders, addInflight, apiKey, apiAddress, apiModels } = this.props;

        let file = this.queue.shift();
        const { path, fileName, ext } = this.matchFileParts(file);

        let model = folders.find(folder => (folder.path + sep) == path).model;
        if (!model || !apiModels.some(apiModel => apiModel.value == model)) return;
        
        this.inflightReqs--; //Kind of like a semaphore, limits how many jobs we can start at once
        removeQueue(path + fileName + ext);
        
        const formData = new mFormData();
        const filePath = path + fileName + ext;
        if (!existsSync(filePath)) return;
        
        formData.append('io_rgb', readFileSync(filePath), filePath);
        formData.append('model_id', this.rootNavModel); //3 is rootnav, hardcoded. Unlikely to change.
        formData.append('key', apiKey);
        formData.append('io_id', fileName);
        formData.append('io_model', model);
        const config = { headers: formData.getHeaders() };

        //Add file to inflight object with the model it's been processed with, and its ext, so we can requeue later if needed
        addInflight({ //Relay inflight change to frontend
            name: path + fileName,
            model,
            ext
        });

        post(apiAddress + "/job", formData, config).then(res => 
        {
            if (res.data) setTimeout(() => this.pollJob(res.data[0], path + fileName), API_POLLTIME); //absolute path to file, with no ext
        })
        .catch(err => {
            console.error(err);
        });
    }

    pollJob = (jobID, filePath) => {
        get(this.props.apiAddress + "/job/" + jobID).then(res => {
            if (res.data == 'COMPLETED') this.getOutput(jobID, filePath); 
            else if (res.data == 'PROCESSING' || res.data == 'PENDING') setTimeout(() => this.pollJob(jobID, filePath), API_POLLTIME); 
        })
        .catch(err => console.error(err))
    }

    getOutput = (jobID, filePath) => {

        let requests = [
            get(this.props.apiAddress + "/job/" + jobID + "/output/rsml"),
            get(this.props.apiAddress + "/job/" + jobID + "/output/first_order",  {responseType: 'stream'}),
            get(this.props.apiAddress + "/job/" + jobID + "/output/second_order", {responseType: 'stream'})
        ]
        const { updateFile, removeInflight, inflightFiles, folders, addQueue } = this.props;

        Promise.all(requests).then(responses => { //returns an array of the completed responses once they've all finished
            let exts = {};
            const { path, fileName } = matchPathName(filePath); //folder path and filename, no trailing / on the folder

            if (inflightFiles[filePath].model != folders.find(folder => folder.path == path).model)
            {
                //Has the model changed in state since we posted the request? Then ignore and requeue
                addQueue([path + sep + fileName + inflightFiles[filePath].ext]);
                this.queue.push(path + sep + fileName + inflightFiles[filePath].ext); //Readd to queue
            }
            
            else responses.forEach(res => {
                //Need to handle 400s, 404s, errors and timeouts too.
                let type = res.config.url.match(/.+\/(.+)/)[1]; //returns rsml or first_order or second_order
                if (type == 'first_order') type = '_C1'; //Modulate them to _C1 or _C2 because Mike asked us to
                if (type == 'second_order') type = '_C2';

                if (type != 'rsml') res.data.pipe(createWriteStream(filePath + type + '.png')) //name_C1.png
                else 
                {
                    writeFileSync(filePath + '.rsml', res.data); //sync just for safety here. Maybe not necessary
                    this.structurePolylines(path, fileName, res.data);
                }
                exts[type] = true; 
            });

            removeInflight(filePath);
            updateFile(path, fileName, exts); //there isn't really any proof checking here :think:
        })
        .catch(err => { removeInflight(filePath); console.error(err) });

        //This doesn't work in Win7, needs testing in Win10.
        if (Object.keys(inflightFiles).length == 0 && this.queue.length == 0)
        {
            new Notification("RootNav Portal", {
                title: "Content-Image Notification",
                body: "Images finished processing",
                icon: path.join(__dirname, 'resources', 'icons', '16x16.png')
            });
        }
        this.inflightReqs++;
    }

    render()
    {
        return ""
    }

    matchFileParts = file => file.match(/(?<path>.+(?:\\|\/))(?<fileName>.+?)(?<ext>\..+)/).groups; //Matches the file path into the absolute directory path/, file name and .ext
}
