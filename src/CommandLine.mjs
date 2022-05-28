//@ts-check
import * as readline from "readline";
import fs from "fs";
import BrowserContext from "../lib/BrowserContext.mjs";
import DomNavigator from "../lib/domnav/DomNavigator.mjs";
import Logger from "../lib/Logger.mjs";
import NetworkLogger from "../lib/NetworkLogger.mjs";
import CommandLineHelp from "./CommandLineHelp.mjs";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
/**
 * @param {string} query 
 * @returns {Promise<string>}
 */
const prompt = (query) => new Promise((resolve, _) => rl.question(query, resolve));

class CommandLineHandler{
    /**
     * @type {BrowserContext}
     */
    browserContext;

    /**
     * @type {NetworkLogger}
     */
    networkLogger;
    
    /**
     * Array, because you may enter an iframe
     * @type {DomNavigator[]}
     */
    domNavigators = [];

    /**
     * Used in navigation mode.
     * @type {devtools.Protocol.DOM.Node[]}
     */
    travelPath = [];

    navigationMode = false;

    /**
     * @param {BrowserContext} browserContext 
     * @param {NetworkLogger} networkLogger 
     */
    constructor(browserContext, networkLogger){
        this.browserContext = browserContext;
        this.networkLogger = networkLogger;
    }

    /**
     * @param {string} cmd
     * @returns {Promise<boolean>} whether exit sequence is received  
     */
    async handleCommand(cmd){
        let parsedCmd = this.parseCommand(cmd);
        let store = this.networkLogger.getStore();
        let entries;
        try{
            if(this.navigationMode){
                this.navigationMode = !await this.handleNavigationCommand(parsedCmd);
                return false;
            }
            switch(parsedCmd[0]){
                case "exit": case "done": case "quit": 
                    return true;
                case "help":
                    CommandLineHelp.printHelp();
                    break;
                case "man":
                    CommandLineHelp.showManual(parsedCmd[1]);
                    break;
                // Navigation mode
                case "nav":
                    Logger.instance.warn("[+] Entering DOM Navigation mode");
                    this.navigationMode = true; 
                    break;
                // Network logger mode
                case "list":
                    entries = store.getSequencedRequests();
                    entries.forEach((entry) => {
                        if(!entry.getReq()?.getUrl().startsWith("data:image/"))
                            console.log(entry.getId(), entry.getReq()?.getUrl());
                    });
                    break;
                case "inspect": case "find": 
                    console.log(store.get(parsedCmd[1]));
                    break;
                case "request": case "req": 
                    console.log(store.get(parsedCmd[1]).getReq());
                    break;
                case "response": case "res":
                    console.log(store.get(parsedCmd[1]).getRes());
                    break;
                case "reqbody":
                    for(let logger of this.networkLogger.getSubframesNetlog()){
                        let postData = await logger.context.getNetwork().getRequestPostData({requestId: parsedCmd[1]});
                        if(postData)
                            console.log(postData.postData);
                    }
                    break;
                case "resbody": case "body":
                    if(parsedCmd[2] === "decode")
                        console.log(Buffer.from(store.get(parsedCmd[1]).getRes().getBody().body, "base64").toString());
                    else
                        console.log(store.get(parsedCmd[1]).getRes().getBody());
                    break;
                case "cookie":
                    console.log((await this.browserContext.getNetwork().getAllCookies()).cookies);
                    break;
            }
        }catch(e){
            Logger.instance.err(e);
        }
        return false;
    }

    /**
     * @param {string[]} parsedCmd
     * @returns {Promise<boolean>} whether exit sequence is received  
     */
    async handleNavigationCommand(parsedCmd) {
        if(this.domNavigators.length == 0){
            Logger.instance.log("[+] Dom Navigator not found, creating a new one...");
            this.domNavigators.push(new DomNavigator(this.browserContext.getDOM()));
        }
        let nodeId;
        let childIndex;
        let childNode;
        let latestTravelPathNode = this.travelPath.length == 0? null : this.travelPath[this.travelPath.length-1];
        let latestDomNavigator = this.domNavigators[this.domNavigators.length-1];
        switch(parsedCmd[0]){
            case "exit": case "done": case "quit": 
                return true;
            case "help":
                CommandLineHelp.printNavigationHelp();
                break;
            case "man":
                CommandLineHelp.showManual(parsedCmd[1]);
                break;
            case "html":
                let rawHtml = await latestDomNavigator.dom.getOuterHTML({nodeId: (await latestDomNavigator.getDocument()).nodeId});
                console.log(rawHtml);
                if(parsedCmd[1] === "dump")
                    fs.writeFileSync("dump" + new Date().getTime() + ".html", rawHtml.outerHTML);
                break;
            case "reset":
                this.domNavigators = [];
                this.travelPath = [];
                break;
            case "node":
                let node = await latestDomNavigator.describeBackendNode(parseInt(parsedCmd[1]));
                this.travelPath.push(node);
                console.log(node);
                break;
            case "iframe":
                if(!parsedCmd[1])
                    break;
                this.domNavigators.push(new DomNavigator((await latestDomNavigator.createNewFrame(this.browserContext, parsedCmd[1])).getDOM()));
                Logger.instance.log("[+] Entered iframe. Use 'doc' to get its root document");
                break;
            case "doc":
                let docNode = await latestDomNavigator.describeNode((await latestDomNavigator.getDocument(-1)).nodeId);
                this.travelPath.push(docNode);
                console.log(docNode);
                break;
            case "child":
                if(!parsedCmd[1]){
                    console.log(latestTravelPathNode.children);
                    break;
                }
                childIndex = parseInt(parsedCmd[1]);
                childNode = await latestDomNavigator.describeBackendNode(latestTravelPathNode.children[childIndex].backendNodeId);
                this.travelPath.push(childNode);
                console.log(childNode);
                break;
            case "leaveiframe":
                this.domNavigators.pop();
                break;
            case "back": case "pop":
                this.travelPath.pop();
                break;
            case "path":
                console.log("Iframe path:", this.domNavigators);
                console.log("Travel path:", this.travelPath);
                break;
            case "query":
                if(!parsedCmd[1])
                    break;
                let nodes = await latestDomNavigator.querySelectorAll(parsedCmd[1]);
                nodes.forEach(console.log);
                break;
            case "desc":
                if(!parsedCmd[1])
                    break;
                nodeId = parseInt(parsedCmd[1]);
                console.log(await latestDomNavigator.describeBackendNode(nodeId));
                break;
        }
        return false;
    }

    /**
     * eg. "a b c" returns ["a", "b", "c"]
     * @param {string} rawcmd 
     * @returns {string[]}
     */
    parseCommand(rawcmd){
        let result = [];
        let currentString = "";
        let isStringDetected = false;
        for(let c of rawcmd){
            if(isStringDetected){
                currentString += c;
                continue;
            }
            if(c == " "){
                result.push(currentString);
                currentString = "";
                continue;
            }else if(c == "\"" || c == "'"){
                isStringDetected = !isStringDetected;
                continue;
            }
            currentString += c;
        }
        if(currentString != "")
            result.push(currentString);
        return result;
    }

    done(){
        rl.close();
    }
}

export { prompt, CommandLineHandler };
