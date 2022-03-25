///@ts-check

class RequestEntry{
    /**
     * Do not recommend creating the entry using constructor
     * @param {string} id
     * @param {devtools.Protocol.Network.Request} req
     * @param {devtools.Protocol.Network.Headers} extraHeaders 
     */
     constructor(id, req, extraHeaders = null, type = "", timestamp = 0){
        this.id = id;
        this.req = req;
        this.extraHeaders = extraHeaders;
        this.type = type;
        this.timestamp = timestamp;

        this.method = "";
        this.url = "";
        if(req){
            this.method = req.method;
            this.url = req.url;
        }
    }

    getMethod(){
        return this.method;
    }

    getUrl(){
        return this.url;
    }

    /**
     * @param {devtools.Protocol.Network.Headers} extraHeaders 
     */
    setExtraHeaders(extraHeaders){
        this.extraHeaders = extraHeaders;
    }

    /**
     * Get post data by
     * ```js
     * await Network.getRequestPostData({requestId: this.id})
     * ```
     * @returns whether data is sent to server
     */
    hasBody(){
        return this.req.hasPostData;
    }
    
    /**
     * @param {RequestEntry} res 
     */
    fillEmptyPropsWith(res){
        if(!this.extraHeaders) this.extraHeaders = res.extraHeaders;
        if(!this.type) this.type = res.type;
        if(!this.timestamp) this.timestamp = res.timestamp;
        if(!this.hasResBody) this.hasResBody = res.hasResBody;
    }
}

export default RequestEntry;