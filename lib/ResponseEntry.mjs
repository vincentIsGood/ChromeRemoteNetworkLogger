///@ts-check

class ResponseEntry{
    /**
     * Do not recommend creating the entry using constructor
     * @param {string} id
     * @param {devtools.Protocol.Network.Response} res
     * @param {devtools.Protocol.Network.Headers} extraHeaders 
     */
    constructor(id, res, extraHeaders = null, type = "", timestamp = 0){
        this.id = id;
        this.res = res;
        this.extraHeaders = extraHeaders;
        this.type = type;
        this.timestamp = timestamp;

        this.hasResBody = false;
    }

    /**
     * @param {devtools.Protocol.Network.Headers} extraHeaders 
     */
    setExtraHeaders(extraHeaders){
        this.extraHeaders = extraHeaders;
    }

    setHasBody(){
        this.hasResBody = true;
    }

    /**
     * If true, then get the body like this 
     * ```js
     * await Network.getResponseBody({requestId: this.id})
     * ```
     */
    hasBody(){
        return this.hasResBody;
    }

    /**
     * @param {ResponseEntry} res 
     */
    fillEmptyPropsWith(res){
        if(!this.extraHeaders) this.extraHeaders = res.extraHeaders;
        if(!this.type) this.type = res.type;
        if(!this.timestamp) this.timestamp = res.timestamp;
        if(!this.hasResBody) this.hasResBody = res.hasResBody;
    }
}

export default ResponseEntry;