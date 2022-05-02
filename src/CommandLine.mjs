//@ts-check
import * as readline from "readline";
import BrowserContext from "../lib/BrowserContext.mjs";
import Logger from "../lib/Logger.mjs";
import NetworkLogger from "../lib/NetworkLogger.mjs";

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
     * @param {BrowserContext} browserContext 
     * @param {NetworkLogger} networkLogger 
     */
    constructor(browserContext, networkLogger){
        this.browserContext = browserContext;
        this.networkLogger = networkLogger;
    }

    /**
     * @param {string} cmd
     * @returns {boolean} whether exit sequence is received  
     */
    handleCommand(cmd){
        let parsedCmd = this.parseCommand(cmd);
        let store = this.networkLogger.getStore();
        let entries;
        try{
            switch(parsedCmd[0]){
                case "exit": case "done": case "quit": return true;
                case "help":
                    this.printHelp();
                    break;
                case "man":
                    this.showManual(parsedCmd[1]);
                    break;
                case "list":
                    entries = store.getSequencedRequests();
                    entries.forEach((entry) => {
                        if(!entry.getReq()?.getUrl().startsWith("data:image/"))
                            console.log(entry.getId(), entry.getReq()?.getUrl());
                    });
                    break;
                case "inspect": case "find": 
                    entries = store.getSequencedRequests();
                    console.log(store.get(parsedCmd[1]));
                    break;
                case "reqbody":
                    this.browserContext.getNetwork().getRequestPostData({requestId: parsedCmd[1]});
                    break;
                case "resbody": case "body":
                    if(parsedCmd[2] === "decode")
                        console.log(Buffer.from(store.get(parsedCmd[1]).getRes().getBody().body, "base64").toString());
                    else
                        console.log(store.get(parsedCmd[1]).getRes().getBody());
                    break;
            }
        }catch(e){
            Logger.instance.err(e);
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

    printHelp(){
        Logger.instance.info("Available Commands:"); 
        Logger.instance.info("exit, done, quit"); 
        Logger.instance.info("help");
        Logger.instance.info("man");
        Logger.instance.info("list");
        Logger.instance.info("inspect, find"); 
        Logger.instance.info("reqbody");
        Logger.instance.info("resbody, body");
    }

    /**
     * @param {string} cmd 
     */
    showManual(cmd){
        switch(cmd){
            case "exit": case "done": case "quit":
                printManPage(cmd, "End program", "");
                break;
            case "help":
                printManPage(cmd, "Get available commands", "");
                break;
            case "man":
                printManPage(cmd, "Show manual for a command", "");
                break;
            case "list":
                printManPage(cmd, "Show a list of stored Request entries. Each line contains request id and its url", "");
                break;
            case "inspect": case "find":
                printManPage(cmd, 
                    "Inspect a request id which shows its corresponding response as well", 
                    "inspect <request id>");
                break;
            case "reqbody":
                printManPage(cmd, 
                    "Shows request body (post data)\nArg <request id>: Comes from `list`", 
                    "reqbody <request id>");
                break;
            case "resbody": case "body":
                printManPage(cmd, 
                    "Shows response body\nArg <request id>: Comes from `list`", 
                    "body <request id> [decode]");
                break;
        }
    }
}

/**
 * @param {string} cmd 
 * @param {string} summary 
 * @param {string} desc 
 */
function printManPage(cmd, summary, desc){
    console.log(`${cmd.toUpperCase()}          User Commands          ${cmd.toUpperCase()}`);
    console.log("");
    console.log(`SYNOPSIS\n    ${summary}`);
    console.log("");
    console.log(`DESCRIPTION\n    ${desc}`);
    console.log("");
}

export {prompt, CommandLineHandler};