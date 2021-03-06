const { ApiPromise, WsProvider } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');

const express = require('express'); // Include ExpressJS
const app = express(); // Create an ExpressJS app
const bodyParser = require('body-parser'); // middleware

var session = require('express-session');//session

require("dotenv").config({path: '.env'});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({resave: true, saveUninitialized: true, secret: 'XCR3rsasa%RDHHH', cookie: { maxAge: 60000 }}));

const port = 3000 
var sessionData;

app.listen(port, () => console.log(`This app is listening on port ${port}`));
    
app.get('/', async (req, res) => { 
  res.sendFile(__dirname + '/UI/static/index.html');
});


app.get('/login', async (req, res) => { 
  res.sendFile(__dirname + '/UI/static/login.html');
});


app.post('/homepage', async (req, res) => {
   
        let username = req.body.username;
        console.log("username ",username);

        sessionData = req.session;
        sessionData.user = {};
        sessionData.user.username = username;

        var istrue = await verify(username);
        console.log("istrue ",istrue);
        if(istrue) {
          res.sendFile(__dirname + '/UI/homepage.html');
        } else {
        res.send(`Enter correct user name`);
        }
});


app.get('/queryEvent', async (req, res) => { 

    console.log("checkSession doing");
    checkSession(req, res);
    console.log("checkSession done");

    let _startblock = req.query.startblock;
    let _endBlock = req.query.endBlock;
    let _endPoint = req.query.endPoint;


    console.log("_startblock ", _startblock ," _endBlock ", _endBlock, " _endPoint ", _endPoint);

    var details = await queryEvent(_startblock,_endBlock,_endPoint);
    console.log("details ", details)
    res.send(details)
});
  
  
// Logout
app.get('/logout', async function(req, res, next) {

  req.session.destroy();
  res.sendFile(__dirname + '/UI/static/login.html');
});


const verify = async (username) => { //to verify the user.

  console.log("calling verify ",username)

  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  console.log("httpProvider")
  const api = await ApiPromise.create({ provider: httpProvider });  
  console.log("api")

  const { decodeAddress, encodeAddress } = require('@polkadot/keyring');//val  
  const { hexToU8a, isHex } = require('@polkadot/util'); //val

  const address = username //process.env.ADDRESS
  console.log("address ",address)
  try {
    encodeAddress(
      isHex(address)
        ? hexToU8a(address)
        : decodeAddress(address)
    );
    console.log("true ",true)
      return true
  } catch (error) {
    console.log("false ",false)
    return false;
  }
}



const queryEvent = async (_startblock,_endBlock,_endPoint) => { 

        console.log("queryEvent ",_startblock, _endBlock ,_endPoint );
        var providerObj;

        if(_endPoint.toString() =="wss://rpc.polkadot.io"){
          providerObj= new WsProvider(_endPoint)
        }else {
          providerObj = new HttpProvider(_endPoint)
        }

        console.log("httpProvider")
        const api = await ApiPromise.create({ provider: providerObj });  
        console.log("api")
        var _endBlockNumber=0; 
        var initialBlock = 0
        initialBlock  = _startblock
        let eventArray = [];
        if(_endBlock == "latest block") {
            console.log("latest block ")
            let header = await api.rpc.chain.getHeader();
            let _endBlockNumber = header.toJSON().number;
            console.log("_endBlockNumber ", _endBlockNumber)
        } else {
            _endBlockNumber=_endBlock;
            console.log("_endBlockNumber ", _endBlockNumber)
        }

        console.log("_startblock ", _startblock)
      // var range  = _endBlockNumber - _startblock;

        var diff = Number(_endBlockNumber.toString())  -  Number(initialBlock.toString()) //Number(_startblock)

        for(i=_endBlockNumber;i>=initialBlock;i--){


          var hash = await api.rpc.chain.getBlockHash(i); 
          var events = await api.query.system.events.at(hash);
          console.log(`\n #${i} Received ${events.length} events:`);

            // loop through the Vec<EventRecord>
            events.forEach((record) => {
                const { event, phase } = record;
                const types = event.typeDef
              
                eventArray.push(
                  `\t${event.section}:${
                    event.method
                  }:: (phase=${phase.toString()}): \t\t${event.meta.documentation.toString()}`
                  );

                  eventArray.push(event.method);
                  eventArray.push(phase.toString());
                  
                });
        }
          return eventArray
}

const checkSession = async (req, res) => { 

  if(!req.session.user){
    JSAlert.alert("Seems like the session does not  exist.Redirecting to the login page");
    res.sendFile(__dirname + '/UI/static/login.html');
 
  } else {

  }

}

        

