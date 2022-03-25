///@ts-check
/**
 *  FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL
 */
 class LogLevels{
    static NONE  = 0;
    static FATAL = 0;
    static ERROR = 1;
    static WARN  = 2;
    static INFO  = 3;
    static DEBUG = 4;
    static TRACE = 5;
    static ALL   = 6;
}

class Logger{
    static instance = new Logger();

    constructor(){
        this.level = LogLevels.INFO;
    }

    /**
     * @param {number} level 
     */
    setLevel(level){
        this.level = level;
    }

    fatal(str){
        if(LogLevels.FATAL <= this.level){
            console.error(str);
        }
    }
    
    error(str){
        if(LogLevels.ERROR <= this.level){
            console.error(str);
        }
    }
    err(str){
        this.error(str);
    }

    warn(str){
        if(LogLevels.WARN <= this.level){
            console.warn(str);
        }
    }

    info(str){
        if(LogLevels.INFO <= this.level){
            console.info(str);
        }
    }
    log(str){
        this.info(str);
    }

    debug(str){
        if(LogLevels.DEBUG <= this.level){
            console.debug(str);
        }
    }

    trace(str){
        if(LogLevels.TRACE <= this.level){
            console.debug(str);
        }
    }
}

export default Logger;
export {LogLevels, Logger};