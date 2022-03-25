///@ts-check
import CDP from "chrome-remote-interface";
import BrowserContext from "./BrowserContext.mjs";

/**
 * CDP DOM Api learned from the github example down below
 * @see https://gist.github.com/imaman/cd7c943e0831a447b1d2b073ede347e2#file-cdp-js-L73
 */
class DomNavigator{
    /**
     * @param {CDP.Client["DOM"]} dom preferably comes from `BrowserContext.getDOM()`
     */
    constructor(dom){
        /**
         * @type {CDP.Client["DOM"]}
         */
        this.dom = dom;
        this.doc = null;
    }

    async getDocument(depth = 0){
        return this.doc? this.doc : this.doc = (await this.dom.getDocument({depth})).root;
    }

    /**
     * You can get an iframe id by accessing the property `frameId`. It can be
     * used to create new CDP like this `CDP({target: frameId});`
     * @param {string} selector 
     * @param {devtools.Protocol.DOM.Node | number} doc (Id of) the node to query upon.
     */
    async querySelector(selector, doc = null){
        /**
         * @type {devtools.Protocol.DOM.QuerySelectorResponse}
         */
        let queryRes;
        if(typeof doc == "number"){
            queryRes = await this.dom.querySelector({nodeId: doc, selector});
        }else{
            if(doc) queryRes = await this.dom.querySelector({nodeId: doc.nodeId, selector});
            else queryRes = await this.dom.querySelector({nodeId: (await this.getDocument()).nodeId, selector});
        }
        return this.describeNode(queryRes.nodeId);
    }

    /**
     * You can get an iframe id by accessing the property `frameId`. It can be
     * used to create new CDP like this `CDP({target: frameId});`
     * @param {string} selector 
     * @param {devtools.Protocol.DOM.Node | number} doc (Id of) the node to query upon.
     */
    async querySelectorAll(selector, doc = null){
        /**
         * @type {devtools.Protocol.DOM.QuerySelectorAllResponse}
         */
        let queryRes;
        if(typeof doc == "number"){
            queryRes = await this.dom.querySelectorAll({nodeId: doc, selector});
        }else{
            if(doc) queryRes = await this.dom.querySelectorAll({nodeId: doc.nodeId, selector});
            else queryRes = await this.dom.querySelectorAll({nodeId: (await this.getDocument()).nodeId, selector});
        }
        const asyncTasks = queryRes.nodeIds.map(nodeId => this.describeNode(nodeId));
        return Promise.all(asyncTasks);
    }

    /**
     * Get CDP of a frame / iframe by frameId.
     * @param {BrowserContext} context used to get debug window info
     * @param {string} frameId 
     */
    async createNewFrame(context, frameId){
        await context.getTarget().getTargets(); // important
        // context.getTarget().getTargetInfo({targetId: frameId}).then(e=>{
        //     console.debug(e.targetInfo.url);
        // });
        
        // add frameId to config
        const CONFIG = context.getConfig();
        CONFIG.target = frameId;
        return BrowserContext.create(CONFIG);
    }

    // ------ Lower Level ------ //
    /**
     * @param {number} nodeId 
     */
    async describeNode(nodeId){
        return (await this.dom.describeNode({nodeId})).node;
    }

    /**
     * @param {devtools.Protocol.DOM.Node} node 
     */
    async resolveBackendNode(node){
        return (await this.dom.resolveNode({backendNodeId: node.contentDocument.backendNodeId})).object;
    }

    /**
     * Resolve remote object into a node
     * @param {devtools.Protocol.Runtime.RemoteObject} remoteObject 
     * @returns node id of the requested node
     */
    async requestNode(remoteObject){
        return (await this.dom.requestNode({objectId: remoteObject.objectId})).nodeId;
    }
}

export default DomNavigator;