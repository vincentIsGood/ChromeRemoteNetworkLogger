///@ts-check
import BrowserContext from "./BrowserContext.mjs";
import DomNavigator from "./DomNavigator.mjs";
import FetchingFailedError from "./FetchingFailedError.mjs";
import Logger from "./Logger.mjs";
import ReqResEntry from "./ReqResEntry.mjs";
import RequestEntry from "./RequestEntry.mjs";
import RequestStore from "./RequestStore.mjs";
import ResponseEntry from "./ResponseEntry.mjs";

/**
 * How to sniff requests from iframes?
 * @see https://gist.github.com/imaman/cd7c943e0831a447b1d2b073ede347e2
 */
class NetworkLogger{
    /**
     * Remember to call `setup()` before `loadPage()`
     * @param {string} url `null` if the context is already loading a page (eg. iframe)
     * @param {BrowserContext} context 
     * @param {boolean} isIframe 
     * @param {RequestStore} requestStore
     */
    constructor(url, context, isIframe = false, requestStore = new RequestStore()){
        this.url = url;
        this.context = context;
        this.isIframe = isIframe;
        this.store = requestStore;

        /**
         * [frameId: string]: NetworkLogger
         * @type {Map<string, NetworkLogger>}
         */
        this.subframes = new Map();
    }

    getStore(){
        return this.store;
    }

    getSubframesNetlog(){
        /**
         * @type {NetworkLogger[]}
         */
        let result = [];
        this.subframes.forEach((v)=>result.push(v));
        return result;
    }

    getSubframesStores(){
        return this.getSubframesNetlog().map(netlog => netlog.getStore());
    }

    async setup(includeIframes = false){
        const frameId = await this.context.getFrameId();
        const frameIdTrunc = frameId.substring(0, 3) + "..." + frameId.substring(frameId.length-3);

        Logger.instance.debug(`[${frameId}] Setting up`);

        // debug only
        this.context.client.on("event", (e)=>{
            if(e.method == "DOM.setChildNodes")
                return;
            Logger.instance.debug(`[${frameIdTrunc}] ${e.method}`);
        });

        // Setup handlers (note that ExtraInfo may come in first)
        const Network = this.context.getNetwork();
        Network.on("requestWillBeSent", (e)=>{
            const {requestId, request, type, timestamp} = e;
            let req = new RequestEntry(requestId, request, null, type, timestamp);
            this.store.safeGet(requestId).setRequest(req);
            Logger.instance.debug(`[${requestId}] ${request.url}`);
        });
        Network.on("requestWillBeSentExtraInfo", (e)=>{
            const {requestId, headers} = e;
            if(!this.store.has(requestId))
                this.store.put(requestId, new ReqResEntry(requestId, new RequestEntry(requestId, null, headers)));
            else this.store.get(requestId).getReq().setExtraHeaders(headers);
        });
        Network.on("responseReceived", (e)=>{
            const {requestId, response, type, timestamp} = e;
            let res = new ResponseEntry(requestId, response, null, type, timestamp);
            this.store.safeGet(requestId).setResponse(res);
        });
        Network.on("responseReceivedExtraInfo", (e)=>{
            const {requestId, headers} = e;
            if(!this.store.safeGet(requestId).getRes())
                this.store.get(requestId).setResponse(new ResponseEntry(requestId, null, headers));
            else this.store.get(requestId).getRes().setExtraHeaders(headers);
        });
        Network.on("dataReceived", (e)=>{
            if(!this.store.safeGet(e.requestId).getRes())
                this.store.get(e.requestId).setResponse(new ResponseEntry(e.requestId, null, null));
            this.store.get(e.requestId).getRes().setHasBody();
            this.context.getNetwork().getResponseBody({requestId: e.requestId}).then(res => {
                this.store.get(e.requestId).getRes().setBody(res);
            });
        });
        Network.on("loadingFailed", (e)=>{
            if(!this.store.safeGet(e.requestId).getError())
                this.store.get(e.requestId).setError(new FetchingFailedError(e));
            this.store.get(e.requestId).setError(new FetchingFailedError(e));
        })

        const Page = this.context.getPage();
        Page.on("loadEventFired", async (e)=>{
            if(includeIframes){
                this.captureIframeNetworkTraffic();
            }
        });
        
        // Wait until DOM is built, I want non-undefined document so as to get the iframe(s).
        Page.on("frameDetached", async (e)=>{
            if(includeIframes && this.isIframe){
                this.captureIframeNetworkTraffic();
            }
        });
    }
    async captureIframeNetworkTraffic(){
        const domNav = new DomNavigator(this.context.getDOM());
        const iframeNodes = await domNav.querySelectorAll("iframe");
        for(let iframeNode of iframeNodes){
            if(!this.subframes.has(iframeNode.frameId)){
                let netlog = new NetworkLogger(null, await domNav.createNewFrame(this.context, iframeNode.frameId), true, this.store);
                this.subframes.set(iframeNode.frameId, netlog);
                netlog.setup(true);
            }
        }
    }

    async loadPage(){
        const Page = this.context.getPage();
        
        if(this.url)
            await Page.navigate({url: this.url});
        
        // @ts-ignore
        // special: it loads the page AS WELL
        await Page.loadEventFired();

        // Have no loading effect:
        // Page.on("loadEventFired", (e)=>{...});
    }

    close(){
        this.context.close();
        this.subframes.forEach(netlog => netlog.close());
    }

    reset(){
        this.url = "";
        this.log = {};
        this.subframes = new Map();
    }
}

export default NetworkLogger;