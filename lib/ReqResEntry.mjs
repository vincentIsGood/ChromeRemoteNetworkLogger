///@ts-check
import FetchingFailedError from "./FetchingFailedError.mjs";
import RequestEntry from "./RequestEntry.mjs";
import ResponseEntry from "./ResponseEntry.mjs";

/**
 * Request-Response Entry
 */
class ReqResEntry{
    /**
     * @param {string} id
     * @param {RequestEntry} requestEntry
     * @param {ResponseEntry} responseEntry
     * @param {FetchingFailedError} error
     */
    constructor(id, requestEntry = null, responseEntry = null, error = null){
        this.id = id;
        this.req = requestEntry;
        this.res = responseEntry;
        this.error = error;
    }

    getId(){
        return this.id;
    }

    getReq(){
        return this.req;
    }

    getRes(){
        return this.res;
    }

    getError(){
        return this.error;
    }

    isFailed(){
        return this.error != null;
    }

    /**
     * Will fill in `null` extraHeaders if existing one exists
     * @param {RequestEntry} requestEntry 
     */
    setRequest(requestEntry){
        if(!this.req){
            this.req = requestEntry;
            return;
        }
        this.req.fillEmptyPropsWith(requestEntry);
    }

    /**
     * Fills empty properties of the current response if exist
     * @param {ResponseEntry} responseEntry 
     */
    setResponse(responseEntry){
        if(!this.res){
            this.res = responseEntry;
            return;
        }
        this.res.fillEmptyPropsWith(responseEntry);
    }

    /**
     * @param {FetchingFailedError} error 
     */
    setError(error){
        this.error = error;
    }
}

export default ReqResEntry;