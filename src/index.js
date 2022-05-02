#!/usr/bin/env node

/// @ts-check
import BrowserContext from "../lib/BrowserContext.mjs";
import Logger, { LogLevels } from "../lib/Logger.mjs";
import NetworkLogger from "../lib/NetworkLogger.mjs";
import { prompt, CommandLineHandler } from "./CommandLine.mjs";
import fs from "fs";
import ReqResEntry from "../lib/ReqResEntry.mjs";

/// @config-check
const OUTPUT_JSON_TO_FILE = false;
const OUTPUT_FILE = "out.json";

const CONFIG = {
    host: "127.0.0.1",
    port: 9222,
    local: true,
};

let TARGET_URL = "https://google.com/";
/// @end-config-check

Logger.instance.setLevel(LogLevels.INFO);

// Suppress it normally
process.on("unhandledRejection", (err, p)=>{
    Logger.instance.debug(`UnhandledPromiseRejectionWarning: ${err}`);
    Logger.instance.debug("Rejected Promise: " + p);
});

// Command line
if(process.argv[2]){
    let url = new URL(process.argv[2]);
    if(url.protocol.startsWith("http")){
        TARGET_URL = process.argv[2];
    }
}

(async ()=>{
    let context = null;
    let networkLogger = null;
    let cmdHandler = null;
    try{
        context = await BrowserContext.create(CONFIG);
        networkLogger = new NetworkLogger(TARGET_URL, context);
        await networkLogger.setup(true);
        await networkLogger.loadPage();

        cmdHandler = new CommandLineHandler(context, networkLogger);

        while(!cmdHandler.handleCommand(await prompt("[+] Input command: ")));
        
        // Listing out everything.
        const logResult = networkLogger.store.getSequencedRequests();
        try{
            logResult.sort((a, b)=> a.getReq().timestamp - b.getReq().timestamp);
        }catch(err){
            // Prevent getReq() giving null
            Logger.instance.error(`Log results cannot be sorted by timestamp (reason: ${err})`);
        }
        Logger.instance.log(logResult);
        Logger.instance.log("Total Requests: " + logResult.length);

        // 
        if(OUTPUT_JSON_TO_FILE){
            Logger.instance.log("Output results to file: " + OUTPUT_FILE);
            writeLogToFile(OUTPUT_FILE, logResult);
        }
    }catch(err){
        Logger.instance.error(err);
    }finally{
        if(networkLogger) networkLogger.close();
        if(cmdHandler) cmdHandler.done();
    }
})();

/**
 * @param {ReqResEntry[]} logs 
 */
function writeLogToFile(file, logs){
    fs.writeFileSync(file, JSON.stringify(logs));
}