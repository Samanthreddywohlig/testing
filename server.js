require('dotenv').config()
const express = require('express');
const app = express();
var geoip = require('geoip-lite');
const cors = require('cors');
var bodyParser = require('body-parser');
const WinstonLogStash = require('winston3-logstash-transport');


const ERROR_GETTING_IP_DETAILS = "Error getting IP details";
const IP_NOT_FOUND = "IP not found in request";

const SUCCESS_CODE = 200;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERROR = 500;

const Logger = require("./logger");
const logger = Logger.logger();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/ip/details', (req,res ) => {
    try{
        logger.info({ip: req.body.ip || req.query.ip});
        const ip = req.body.ip || req.query.ip;
        //ip is not being validated fully
        if(!ip){
            return res.status(400).send({message: null, error: IP_NOT_FOUND}); ///throw bad request
        }
        const response = geoip.lookup( ip );
        return res.status(200).send({error: null, message: response });
    }catch( error ){
        console.log( error )
        logger.error({error: error})
        return res.status(400).send({error: ERROR_GETTING_IP_DETAILS, message: null });
    }
})

app.listen(`${process.env.PORT}`, () => console.log(`app listening on port ${process.env.PORT}!`));