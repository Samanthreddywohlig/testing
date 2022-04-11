/**
 * Log format 
 */

require("dotenv").config();
const winston = require('winston');
const winstonES = require('winston-elasticsearch');
const userAgent = require('express-useragent');
const _ = require('lodash');
const WinstonLogStash = require('winston3-logstash-transport');
const ecsFormat = require('@elastic/ecs-winston-format')

//custom format
const customFormat = winston.format.printf((data) => {
    return JSON.stringify({
        "@timestamp": data.timestamp , 
        "message": data.message,
        "log.level": data.level,
        "ip": data.meta?data.meta.ip: null,
        "device": data.meta?data.meta.device: null,
        "service": process.env.SERVICE_NAME,
        "extra": data //log level
    })
});

class Logger{
    constructor(){
        this.winstonLogger = winston.createLogger({
            transports:[
                new winston.transports.Console()
            ],
            format:ecsFormat()
        })
        this.winstonLogger.add(new WinstonLogStash({
            //move it to environment variables
            mode: 'tcp',
            host: '127.0.0.1',
            port: 5000
          }));
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
        return Object.assign(obj,meta);
    }
}

const logger = new Logger();
module.exports = logger;