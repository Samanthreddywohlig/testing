/**
 * Log format 
 */
require("dotenv").config();
const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const userAgent = require('express-useragent');
const _ = require('lodash');
const WinstonLogStash = require('winston3-logstash-transport');
const ecsFormat = require('@elastic/ecs-winston-format')
require('winston-logstash');

//Logger
class Logger{
    constructor(){
        this.winstonLogger = winston.createLogger({
            transports:[
                new winston.transports.Console(),
                new winston.transports.File({
                    //path to log file
                    filename: 'logs/log.json',
                    level: 'debug'
                  }),
            ],
            format:  winston.format.combine(
                ecsFormat()
            )
        })
        this.winstonLogger.add(new WinstonLogStash({
            port: process.env.LOGSTASH_PORT,
            host: process.env.LOGSTASH_HOST,
            mode: process.env.LOGSTASH_FORMAT,
            applicationName: process.env.SERVICE_NAME,
            label: "NODEJS",
            formatted: true
          }));
    }

    logger(){
        return this.winstonLogger;
    }

    //function used to parse the request
    parse( req ){
        var source = req.headers['user-agent'];
        var ua = userAgent.parse(source);
        const uaDetails = _.pick( ua , ['browser','source','platform','os']);
        const obj =  {
            "ip": req.headers['x-forwarded-for'] || req.socket.remoteAddress ,
            "device_browser": uaDetails['browser'],
            "device_source": uaDetails['source'],
            "device_platform": uaDetails['platform'],
            "device_os": uaDetails["os"],
            "service": process.env.SERVICE_NAME,
        }
        return obj;
    }
}

const logger = new Logger();
module.exports = logger;