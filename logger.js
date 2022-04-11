/**
 * Log format 
 */

require("dotenv").config();
const winston = require('winston');
const winstonES = require('winston-elasticsearch');
const userAgent = require('express-useragent');
const _ = require('lodash');

//custom format
const customFormat = winston.format.printf((data) => {
    console.log( data  )
    return {
        "@timestamp": data.timestamp , 
        "message": data.message,
        "log.level": data.level,
        "ip": data.meta.ip,
        "device": data.meta.device,
        "service": process.env.SERVICE_NAME,
        "meta": data.level //log level
    }
})

class Logger{
    constructor(){
        this.winstonLogger = winston.createLogger({
            transports:[
                new winston.transports.Console()
            ],
            format:winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp(),
                customFormat
            )
        })
    }

    logger(){
        return this.winstonLogger;
    }

    //function used to parse the request
    parse( req, meta ){
        var source = req.headers['user-agent'];
        var ua = userAgent.parse(source);
        const obj =  {
            "ip": req.headers['x-forwarded-for'] || req.socket.remoteAddress ,
            "device": _.pick( ua , ['browser','source','platform','os'])
        }
        return {"meta": Object.assign(obj,meta)};
    }
}

const logger = new Logger();
module.exports = logger;