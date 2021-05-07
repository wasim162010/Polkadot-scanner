const { ApiPromise, WsProvider } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config({path: '.env'});

const express = require('express'); // Include ExpressJS
const app = express(); // Create an ExpressJS app
const bodyParser = require('body-parser'); // middleware
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3000 

app.listen(port, () => console.log(`This app is listening on port ${port}`));
    
app.get('/', async (req, res) => { 
  res.sendFile(__dirname + '/UI/static/index.html');
});

// Route to Login Page
        app.get('/login',  async (req, res) => {
        res.sendFile(__dirname + '/UI/static/login.html');
});



app.post('/login', async (req, res) => {

        let username = req.body.username;
        console.log("username ",username);
        var istrue = await verify(username);
        console.log("istrue ",istrue);
        if(istrue) {
          res.sendFile(__dirname + '/UI/homepage.html');
        } else {
        res.send(`Enter correct user name`);
        }
});


app.get('/queryEvent', async (req, res) => { //to verify the user.

    let _startblock = req.query.startblock;
    let _endBlock = req.query.endBlock;
    let _endPoint = req.query.endPoint;

    var details = await queryEvent(_startblock,_endBlock,_endPoint);
    console.log("details ", details)
    res.send(details)
});
  
  


const verify = async (username) => { //to verify the user.

  console.log("calling verify ",username)

  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  console.log("httpProvider")
  const api = await ApiPromise.create({ provider: httpProvider });  
  console.log("api")

  const { decodeAddress, encodeAddress } = require('@polkadot/keyring');//val  
  const { hexToU8a, isHex } = require('@polkadot/util'); //val

  const address = username //process.env.ADDRESS //'5GrpknVvGGrGH3EFuURXeMrWHvbpj3VfER1oX5jFtuGbfzCE';
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



const queryEvent = async (_startblock,_endBlock,_endPoint) => { //to verify the user.

        console.log("queryEvent ",_startblock, _endBlock ,_endPoint );
        var providerObj;

        if(_endPoint.toString() =="default provider set in background"){
          providerObj= new WsProvider("wss://rpc.polkadot.io")
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
        if(_endBlock == "default") {
            console.log("in defautt ")
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
                // eventArray.push(event.section);
              
          
            // loop through each of the parameters, displaying the type and data
            // event.data.forEach((data, index) => {
            //   const { event , phase } = record;
            //     console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
            //     eventArray.push(types[index].type);
            //     eventArray.push(data.toString());
            //   });
        }
          return eventArray
}

        

