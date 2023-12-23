import Logger from "../lib/Logger.mjs";

class CommandLineHelp{
    static printHelp(){
        Logger.instance.info("Available Commands:"); 
        Logger.instance.info("exit, done, quit"); 
        Logger.instance.info("help");
        Logger.instance.info("man");
        Logger.instance.info("list");
        Logger.instance.info("inspect, find"); 
        Logger.instance.info("reqheader, header");
        Logger.instance.info("resheader");
        Logger.instance.info("reqbody");
        Logger.instance.info("resbody, body");
        Logger.instance.info("nav");
        Logger.instance.info("cookie");
        Logger.instance.info("frames");
        Logger.instance.info("detectframes");
    }

    static printNavigationHelp(){
        Logger.instance.info("Available Commands:"); 
        Logger.instance.info("exit, done, quit"); 
        Logger.instance.info("help");
        Logger.instance.info("man");
        
    }

    /**
     * @param {string} cmd 
     */
    static showManual(cmd){
        switch(cmd){
            case "exit": case "done": case "quit":
                printManPage(cmd, 
                    "End program", 
                    "");
                break;
            case "help":
                printManPage(cmd, 
                    "Get available commands", 
                    "");
                break;
            case "man":
                printManPage(cmd, 
                    "Show manual for a command", 
                    "");
                break;
            
            // NetworkLogger-specific commands
            case "list":
                printManPage(cmd, 
                    "Show a list of stored Request entries. Each line contains request id and its url", 
                    "");
                break;
            case "inspect": case "find":
                printManPage(cmd, 
                    "Inspect a request id which shows its corresponding response as well", 
                    "inspect <request id>");
                break;
            case "reqheader": case "header":
                printManPage(cmd, 
                    "Show request header (not extra headers)", 
                    "reqheader <request id>");
                break;
            case "resheader":
                printManPage(cmd, 
                    "Show response header (not extra headers)", 
                    "resheader <request id>");
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
            case "nav":
                printManPage(cmd, 
                    "Get into document dom navigation mode", 
                    "");
                break;
            case "cookie":
                printManPage(cmd, 
                    "Shows the cookies loaded for this tab", 
                    "");
                break;
            case "frames":
                printManPage(cmd, 
                    "Get the subframes for root logger. Output is verbose", 
                    "");
                break;
            case "detectframes":
                printManPage(cmd, 
                    "Detect for iframes in the root page and attach network logger to them", 
                    "");
                break;
            // Dom Navigation-specific commands
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

export default CommandLineHelp;