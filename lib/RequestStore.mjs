///@ts-check
import ReqResEntry from "./ReqResEntry.mjs";

/**
 * Ordered store. By order, it orders according 
 * to what comes in first.
 */
class RequestStore{
    constructor(){
        /**
         * Just a simple map
         * @type {{[requestId: string]: ReqResEntry}}
         */
        this.store = {};
        
        /**
         * Input sequence
         * @type {string[]}
         */
        this.sequence = [];
    }

    /**
     * @param {string} requestId 
     * @param {ReqResEntry} request 
     */
    put(requestId, request){
        this.sequence.push(requestId);
        this.store[requestId] = request;
    }

    /**
     * @param {string} requestId 
     */
    get(requestId){
        return this.store[requestId];
    }

    /**
     * Creates an empty entry for you if not found
     * @param {string} requestId 
     */
    safeGet(requestId){
        if(!this.has(requestId))
            this.put(requestId, new ReqResEntry(requestId));
        return this.store[requestId];
    }

    /**
     * @param {string} requestId 
     */
    has(requestId){
        return this.store[requestId] != undefined;
    }

    getSequence(){
        return this.sequence;
    }

    getAllRequests(){
        return this.store;
    }

    getSequencedRequests(){
        return this.sequence.map(id => {
            return this.store[id];
        });
    }
}

export default RequestStore;