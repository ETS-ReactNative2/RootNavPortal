// @flow
import { Component } from 'react';
import { post, get, defaults } from 'axios';
import { IMAGE_EXTS_REGEX, API_DELETE, API_PARSE, INFLIGHT_REQS, API_POLLTIME, matchPathName, _require, xmlOptions, THUMB_PERCENTAGE, HTTP_PORT, NOTIFICATION_CLICKED, IMAGE_EXTS } from './constants/globals';
import { readFileSync, writeFileSync, createWriteStream, unlink, access, constants, existsSync } from 'fs';
import mFormData from 'form-data';
import { ipcRenderer } from 'electron';
import { sep, join } from 'path';
import parser from 'xml2json';
import imageThumbail from 'image-thumbnail';
import fastifyServer from 'fastify';
const dree = require('dree');  

//arabidopsis_plate, osr_bluepaper, wheat_bluepaper
//Clean everything up once models have been added to state and we're not in debugging
//https://github.com/axios/axios/pull/2874
//When Axios sorts out the socket hang up error on slow responses, update the package back to the main repo
export default class Backend extends Component {
    queue = [];
    inflightReqs = INFLIGHT_REQS; //Concurrency limit
    rootNavModel = -1; //HMR seems to break queues and class vars.
    fastify;
    bForced; //Set by navigator events to force an API check if connectivity changes
    inflightFiles = {}; //This is used instead of Redux's copy because the Redux action doesn't update in time for any requests in callbacks to know if neighboring requests have also finished

    constructor(props)
    {
        super(props)
        defaults.timeout = 0;
        this.fastify = fastifyServer({ 
            logger: process.argv.includes('--packaged=true') ? false : true,
            bodyLimit: 1048576 * 8 //1MiB * X
        });
        this.setupHTTPServer();
        
        //A single directory path {path: ""}
        ipcRenderer.on(API_DELETE, (event, data) => {
            this.handleDelete(data.path);
        });
        
        ipcRenderer.on(API_PARSE, (event, data) => {
            if (!data.length) return;
            let files = data.map(path => this.parseRSML(path));
            this.props.updateParsedRSML(files); //RSML is batch-sent back to Redux to avoid spamming with actions, and killing performance. This does mean thumbs will be able to load all at once, or not at all.
        });
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
        setInterval(this.sendFile, API_POLLTIME);
    }

    //It's worth noting that navigator.onLine will always return true if it succeeds to connect to local adapters such as loopback LANs for Virtualbox, or NPcap for Wireshark etc.
    updateOnlineStatus = event => {
        if (navigator.onLine) //If we get connectivity back, force check for an API connection, which will pickup files for scanning
        { 
            this.bForced = true;
            this.forceUpdate();
        }
        else //If we drop connection, reset all queues and set connection to false.
        {
            this.props.resetQueues();
            this.props.updateAPIStatus(false);
        }
    };

    componentDidUpdate(prevProps)
    {  
        //This will fire once the config gets imported by the gallery, initialising the API values. Only then can we poll for status.
        if ((prevProps.apiAddress != this.props.apiAddress) || (this.props.apiKey != prevProps.apiKey) || this.bForced) //On settings change, poll the API and add missing files to queue if it's up
        {
            this.bForced = false;
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
                if (err.message.includes("401")) 
                    updateAPIAuth(false); //If we get a 401, explicitly set in Redux that we did so the indicator can relay an error regarding the token
                updateAPIStatus(false); 
            });
        }

        //If the number of files in the new files array is larger than the amount of files we have, scan through and check for new ones lacking RSML
        if (Object.values(this.props.files).reduce((acc, value) => acc += Object.keys(value).length, 0) > Object.values(prevProps.files).reduce((acc, value) => acc += Object.keys(value).length, 0)) 
            this.scanFiles(); //If files changes, scan it for queueing.
    }

    /**********************
    **  HTTP
    ***********************/
    //Sets up Fastify as the HTTP server used for thumbnailing, avoiding sending huge packets through IPC and blocking main.
    setupHTTPServer = () => {
        this.fastify.post('/thumb', async (request, reply) => {
            reply.type('application/json').code(200);
            return Promise.all(request.body.map(args => this.genThumbnail(args.folder, args.file, args.fileName))).then(results => {
                return results;
            }).catch(error => console.error(error));
        });

        this.fastify.post('/import', async (request, reply) => {
            reply.type('application/json').code(200);
            return request.body.map((item, i) => dree.scan(item, { depth: 8, exclude: /node_modules|system32|Windows|boot|etc|dev|bin/, extensions: [] } )); //extensions: [] excludes all files, because the modal is a folder picker. Don't change this.
        });

        //Polled before sending thumbs, to check if the backend process has started the server yet
        this.fastify.get('/health', (request, reply) => {
            reply.type('application/json').code(200).send({ up: "y" });
        });

        this.fastify.listen(HTTP_PORT, (err, address) => {
            if (err) 
            {
                this.fastify.log.error(`server listening on ${address}`)
            }
            this.fastify.log.info(`server listening on ${address}`)
        });
    };


    /**********************
    **  File Rescanning
    ***********************/
    //This is called on any file addition, or API update. No IPC is used anymore for queueing files. Even if backend late loads, we should still just pick up all the missed ones
    //On any next iteration. There is a minor risk that if all files are added, and no more get added, and no API settings change, it won't add them to the queue. Very small edge case
    //And the user can always reanalyse anyway. We could make the refresh button also trigger a full scan manually too.
    scanFiles = () => {
        let apiFiles = []; //search through the file structure for anything imported without RSML
        const { files, addQueue } = this.props;

        Object.keys(files).forEach(folder => Object.keys(files[folder]).forEach(file => {
            if (!files[folder][file].rsml)
            {
                let imageExt = Object.keys(files[folder][file]).find(ext => ext.match(IMAGE_EXTS_REGEX));
                let filePath = folder + sep + file + "." + imageExt;
                const { path, fileName } = this.matchFileParts(filePath); //Get the exact same path used for inflightFiles just in case anything differs
                if (imageExt && this.queue.indexOf(filePath) == -1 && !this.inflightFiles[path + fileName]) apiFiles.push(filePath); //Only if it's not already queued/inflight -> maybe API got updated when it was already up
            }
        }));
        if (apiFiles.length && this.props.apiStatus) //cautiously adding this here so queue doesn't get updated if there's no connection. Any API config change will rescan
        {
            this.queue.push(...apiFiles);
            addQueue(apiFiles);
        }
    };

    /**********************
    **  Thumbnailing
    ***********************/
    genThumbnail = (folder, file, fileName) => {
        return new Promise((resolve, reject) => {
            const ext = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));

            imageThumbail.thumb(folder + sep + fileName + "." + ext, { percentage: THUMB_PERCENTAGE, pngOptions: { force: true } }).then(thumb => 
            {
                resolve({ folder, fileName, ext, thumb });
                //this.props.addThumb(folder, fileName, { ext, thumb }) //Bundle the thumbnail with the extension so we can label them pngThumb or similar accordingly in case there are multiple thumbs for a file name
            }).catch(err => console.error(err));
        });
    };

    /**********************
    **  Parsing RSML
    ***********************/
    parseRSML = filePath => {
        const { path, fileName } = matchPathName(filePath);
        //Ingest the RSML here if it's not cached in state
        return this.structurePolylines(path, fileName, readFileSync(path + sep + fileName + ".rsml", 'utf8'));
    };

    structurePolylines = (path, fileName, rsml) => {
        //Ingest the RSML here if it's not cached in state
        let polylines = [];
        let rsmlJson = parser.toJson(rsml, xmlOptions);

        let plant = rsmlJson.rsml[0].scene[0].plant; 
        plant.forEach((plantItem, index) => this.formatPoints(plantItem, index + 1, polylines));
        return { path, fileName, rsmlJson, polylines };
    };
    
    formatPoints = (rsml, plantID, polylines, primaryCount, lateralCount) => {
        if (rsml.geometry) //If the node has geometry, extract it into an array of simplified points
        {
            // polylines: [ {type: "lat", id: "5.3", points: [{x, y}] }]
            polylines.push({ //Creates a flatten array of objects each representing a root.
                type: lateralCount ? "lateral" : "primary",
                id: `${plantID}-${primaryCount}${(lateralCount ? `.${lateralCount}` : "")}`,
                points: rsml.geometry[0].polyline[0].point.map(p => ({ 
                    x: parseFloat(p.x), //Floats still need to be transformed so Fabric can draw them right => but only in the line array, these never end up in the RSML/JSON
                    y: parseFloat(p.y)
                })) //Can also add a * 0.5 to scale the image points down, rather than scaling the canvas
            });
        }
        if (rsml.root)
        {
            rsml.root.forEach((root, index) => this.formatPoints(root, plantID, polylines, 
                primaryCount || (index + 1),  //Pass the indexes through the recursion
                lateralCount || (primaryCount ? (index + 1) : undefined) //Only pass a lateral ID if we're in the second level of recursion of a root tree
            ));
        }
    };
    
    /**********************
    **  Reanalysing Folder
    ***********************/
    //Iterate over state and for each file in the folder, delete the relevant files denoted by existing keys, and add to queue
    //A new object is constructed to be sent to Redux to completely write over that folder. It should contain everything already present bar segmasks and rsml exts
    handleDelete = path => {
        const { files, resetFolder, addQueue } = this.props;
        let newState = {}; //This will need to have an object for each file with the remaining extensions + thumbnails/removed extensions
        let queuedFiles = [];

        if (!files[path] || !Object.keys(files[path]).length) return;
        Object.keys(files[path]).forEach(fileName => {
            newState[fileName] = {}; //Init new folder object
            let queued = false; //Only allow file to be requeued once - else each seg mask/rsml will trigger it
            Object.keys(files[path][fileName]).forEach(extension => { //For each extension in the state object
                
                if (extension == 'parsedRSML') return; //Get rid of the existing parsed polylines and JSON RSML
                if (extension == 'failed') return; //Get rid of fail state if reanalysing
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

                if (!queued && !this.inflightFiles[path + sep + fileName]) //If the file is inflight, don't queue, since model detection/requeueing is done on job receiving
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

    addInflight = file => {
        this.inflightFiles[file.name] = {  model: file.model, ext: file.ext };
        this.props.addInflight(file);
    };

    removeInflight = filePath => {
        delete this.inflightFiles[filePath];
        this.props.removeInflight(filePath);
    }

    /**********************
    **  API Comms
    ***********************/
    //Send the job off to the server
    sendFile = () => {
        if (!this.props.apiStatus || !this.queue.length || !this.inflightReqs || !this.props.apiAuth || this.rootNavModel < 0) return;
        const { removeQueue, folders, apiKey, apiAddress, apiModels } = this.props;

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
        this.addInflight({ //Relay inflight change to frontend
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
    };

    pollJob = (jobID, filePath) => {
        get(this.props.apiAddress + "/job/" + jobID).then(res => {
            if (res.data == 'COMPLETED') this.getOutput(jobID, filePath); 
            else if (res.data == 'PROCESSING' || res.data == 'PENDING') setTimeout(() => this.pollJob(jobID, filePath), API_POLLTIME);
            else if (res.data == "FAILED") {
                const { path, fileName } = matchPathName(filePath);
                this.props.setFailedState(path, fileName, true);
                this.removeInflight(filePath);
            }
        })
        .catch(err => console.error(err))
    };

    getOutput = (jobID, filePath) => {
        let failed = false;
        let requests = [
            get(this.props.apiAddress + "/job/" + jobID + "/output/rsml").catch(err => null),
            get(this.props.apiAddress + "/job/" + jobID + "/output/first_order",  {responseType: 'stream'}).catch(err => null),
            get(this.props.apiAddress + "/job/" + jobID + "/output/second_order", {responseType: 'stream'}).catch(err => null)
        ]
        const { updateFile, folders, addQueue } = this.props;

        Promise.all(requests).then(responses => { //returns an array of the completed responses once they've all finished
            if (responses.some(resp => resp == null)) { // If any responses failed, end.
                const { path, fileName } = matchPathName(filePath);
                this.props.setFailedState(path, fileName, true);
                this.removeInflight(filePath);
                return;
            }
            let exts = {};
            const { path, fileName } = matchPathName(filePath); //folder path and filename, no trailing / on the folder

            if (this.inflightFiles[filePath].model != folders.find(folder => folder.path == path).model)
            {
                //Has the model changed in state since we posted the request? Then ignore and requeue
                addQueue([path + sep + fileName + this.inflightFiles[filePath].ext]);
                this.queue.push(path + sep + fileName + this.inflightFiles[filePath].ext); //Readd to queue
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
                    this.props.updateParsedRSML([this.structurePolylines(path, fileName, res.data)]);
                }
                exts[type] = true; 
            });

            this.removeInflight(filePath);
            updateFile(path, fileName, exts); //there isn't really any proof checking here :think:
            if (Object.keys(this.inflightFiles).length == 0 && this.queue.length == 0)
            {
                let notification = new Notification("RootNav Portal", { //Check this in Win8/10
                    title: "RootNav Portal",
                    body: "Images finished processing",
                    icon: process.argv.includes('--packaged=true') ? join(process.resourcesPath, 'icon.png') : join(process.cwd(), 'resources', 'icon.png')
                });
                notification.onclick = e => ipcRenderer.send(NOTIFICATION_CLICKED);
            }
        })
        .catch(err => { this.removeInflight(filePath); console.error(err) });

        this.inflightReqs++;
    };

    render()
    {
        return ""
    }

    matchFileParts = file => file.match(new RegExp(`(?<path>.+(?:\\\\|\\/))(?<fileName>.+?)(?<ext>\\.${IMAGE_EXTS.join("|")})$`, 'i')).groups; //Matches the file path into the absolute directory path/, file name and .ext
}
