///@ts-check
import CDP from "chrome-remote-interface";

/**
 * A browser context is created with basic connection, 
 * configuration being used to connect to a browser 
 * using `CDP()`. Domains enabling will be done here 
 * as well.
 */
class BrowserContext{
    /**
     * Use `BrowserContext.create()` instead.
     * @param {CDP.Client} client a fully configured client
     * @param {CDP.Options} config used to create client
     */
    constructor(client, config){
        this.client = client;
        this.config = config;
    }

    /**
     * Enables these domains: `Network`, `Page` and `DOM` (and uses `Target`)
     * @param {CDP.Options} config 
     * @returns {Promise<BrowserContext>}
     */
    static async create(config){
        /**
         * @type {CDP.Client}
         */
        const client = await CDP(config);
        const {Network, Page, DOM, Runtime} = client;
        await Network.enable({});
        await Network.setCacheDisabled({cacheDisabled: true});
        await Page.enable();
        await DOM.enable();
        // await Debugger.enable({});
        // Debugger.setBreakpointsActive({active: false});
        // Debugger.setSkipAllPauses({skip: true});
        // await Runtime.enable(); // detectable by page scripts
        return new BrowserContext(client, config);
    }

    getConfig(){
        return this.config;
    }

    getNetwork(){
        return this.client.Network;
    }

    getPage(){
        return this.client.Page;
    }

    getDOM(){
        return this.client.DOM;
    }

    getTarget(){
        return this.client.Target;
    }

    getRuntime(){
        return this.client.Runtime;
    }

    async getFrameId(){
        return (await this.getPage().getFrameTree()).frameTree.frame.id;
    }

    async close(){
        await this.client.close();
    }
}

export default BrowserContext;