///@ts-check
import CDP from "chrome-remote-interface";
import BrowserContext from "../BrowserContext.mjs";

/**
 * CDP DOM Api learned from the github example down below. To learn how backend and frontend
 * works in chromium browsers, click the 2nd link.
 * @see https://gist.github.com/imaman/cd7c943e0831a447b1d2b073ede347e2#file-cdp-js-L73
 * @see https://github.com/WICG/devtools-protocol/issues/9
 */
class DomNavigator{
    /**
     * @param {CDP.Client["DOM"]} DOM preferably comes from `BrowserContext.getDOM()`
     */
    constructor(DOM){
        /**
         * @type {CDP.Client["DOM"]}
         */
        this.dom = DOM;
        this.doc = null;
    }

    /**
     * @param {number} depth subtree depth
     * @returns 
     */
    async getDocument(depth = 1){
        return this.doc? this.doc : this.doc = (await this.dom.getDocument({depth})).root;
    }

    /**
     * You can get an iframe id by accessing the property `frameId`. It can be
     * used to create new CDP like this `CDP({target: frameId});`
     * @param {string} selector 
     * @param {devtools.Protocol.DOM.Node | number} doc (Id of) the node to query upon.
     */
    async querySelector(selector, doc){
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
    async querySelectorAll(selector, doc){
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

    // ------ Very Low Level ------ //
    /**
     * @param {number} nodeId 
     * @param {number} depth The maximum depth at which children should be retrieved
     */
    async describeNode(nodeId, depth = 1){
        return (await this.dom.describeNode({nodeId, depth})).node;
    }

    /**
     * @param {number} backendNodeId 
     * @param {number} depth The maximum depth at which children should be retrieved
     */
    async describeBackendNode(backendNodeId, depth = 1){
        return (await this.dom.describeNode({backendNodeId, depth})).node;
    }

    /**
     * @param {number} nodeId 
     */
    async resolveNode(nodeId){
        return (await this.dom.resolveNode({nodeId})).object;
    }

    /**
     * @param {devtools.Protocol.DOM.Node | number} node 
     */
    async resolveBackendNode(node){
        if(typeof node === "number")
            return (await this.dom.resolveNode({backendNodeId: node})).object;
        return (await this.dom.resolveNode({backendNodeId: node.backendNodeId})).object;
    }

    /**
     * Resolve remote object into a node
     * @param {devtools.Protocol.Runtime.RemoteObject} remoteObject 
     * @returns node id of the requested node
     */
    async requestNode(remoteObject){
        // @ts-ignore
        return (await this.dom.requestNode({objectId: remoteObject.objectId})).nodeId;
    }

    /**
     * Returns by to user by emitting setChildNodes events.
     * @param {number} nodeId 
     * @param {number} depth 
     */
    async requestChildNodes(nodeId, depth = 1){
        return await this.dom.requestChildNodes({nodeId, depth});
    }
}

export default DomNavigator;