/// @ts-check
import BrowserContext from "../lib/BrowserContext.mjs";
import Logger, { LogLevels } from "../lib/Logger.mjs";
import NetworkLogger from "../lib/NetworkLogger.mjs";
import { prompt, rl } from "../lib/util.mjs";
import fs from "fs";
import ReqResEntry from "../lib/ReqResEntry.mjs";

const OUTPUT_JSON_TO_FILE = false;
const OUTPUT_FILE = "out.json";

const CONFIG = {
    host: "127.0.0.1",
    port: 9222,
    local: true,
};

const URL = "https://gogoanimeapp.com/mushoku-tensei-isekai-ittara-honki-dasu-2nd-season-episode-10";

Logger.instance.setLevel(LogLevels.DEBUG);

(async ()=>{
    let context = await BrowserContext.create(CONFIG);
    const networkLogger = new NetworkLogger(URL, context);
    try{
        await networkLogger.setup(true);
        await networkLogger.loadPage();

        await prompt("Done?");
        const logResult = networkLogger.store.getSequencedRequests();
        try{
            logResult.sort((a, b)=> a.getReq().timestamp - b.getReq().timestamp);
        }catch(err){
            // Prevent getReq() giving null
            Logger.instance.error(`Log results cannot be sorted by timestamp (reason: ${err})`);
        }
        Logger.instance.log(logResult);
        Logger.instance.log("Total Requests: " + logResult.length);
        if(OUTPUT_JSON_TO_FILE){
            Logger.instance.log("Output results to file: " + OUTPUT_FILE);
            writeLogToFile(OUTPUT_FILE, logResult);
        }
    }catch(err){
        Logger.instance.error(err);
    }finally{
        if(networkLogger) networkLogger.close();
        rl.close();
    }
})();

/**
 * @param {ReqResEntry[]} logs 
 */
function writeLogToFile(file, logs){
    fs.writeFileSync(file, JSON.stringify(logs));
}