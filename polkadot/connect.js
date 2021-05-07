const { ApiPromise } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config({path: '.env'});

const express = require('express'); // Include ExpressJS
const app = express(); // Create an ExpressJS app
const bodyParser = require('body-parser'); // middleware
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3000 

app.listen(port, () => console.log(`This app is listening on port ${port}`));

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

// queryEvent(_startblock,_endBlock,_endPoint)
const queryEvent = async (_startblock,_endBlock,_endPoint) => { //to verify the user.

  console.log("queryEvent ",_startblock, _endBlock ,_endPoint );
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  console.log("httpProvider")
  const api = await ApiPromise.create({ provider: httpProvider });  
  console.log("api")

  if(_endBlock == "default") {

  }
  //const height = 4886511;
  //const blockHash = await api.rpc.chain.getBlockHash(height);
  let eventArray = [];

  for(i=_endBlock;i>=_startblock;i--){

    var hash = await api.rpc.chain.getBlockHash(i); 
    var events = await api.query.system.events.at(hash);
   // console.log(`\n #${i} Received ${events.length} events:`);

   // api.query.system.events(async (events) => {

     // let header = await api.rpc.chain.getHeader();
      //let blockNumber = header.toJSON().number;

    
      events.forEach((record) => {

        const { event, phase } = record;
        const types = event.typeDef;
        eventArray.push(
          `\t${event.section}:${
            event.method
          }:: (phase=${phase.toString()}): 
          \t\t${event.meta.documentation.toString()}`

      );
    });

    //console.log("eventArray ", eventArray);


   

  //  });
  }

  console.log(eventArray)

  return eventArray
}

const traverseEvents = async() => {

    const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
    console.log("httpProvider")
    const api = await ApiPromise.create({ provider: httpProvider });  
    console.log("api")

    // Subscribe to system events via storage
    api.query.system.events((events) => {
    console.log(`\nReceived ${events.length} events:`);

    // Loop through the Vec<EventRecord>
    events.forEach((record) => {
      // Extract the phase, event and the event types
      
      const { event, phase } = record;
      const types = event.typeDef;

      // Show what we are busy with
      console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
      console.log("documentation ", `\t\t${event.meta.documentation.toString()}`);
      //console.log(`\t\t${event.blockHash}`);
      console.log("event.process " ,`\t\t${event.process}`);

      // Loop through each of the parameters, displaying the type and data
      event.data.forEach((data, index) => {
        console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
      });

    });
  });
    
    
  }


// data: {'startblock':$('#txtStartBlock').val(), 'endBlock':$('#txtEndBlock').val(),'endPoint':$('#txtEndPoint').val() },

// res.sendFile(__dirname + '/static/login.html');

app.get('/', async (req, res) => { //to verify the user.
  await fetchcurblock();
  res.sendFile(__dirname + '/UI/static/index.html');
});


// Route to Login Page
app.get('/login',  async (req, res) => {
  res.sendFile(__dirname + '/UI/static/login.html');
});



app.post('/login', async (req, res) => {
  // Insert Login Code Here
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

  // let page = req.query.page;
  // let limit = req.query.limit;
    let _startblock = req.query.startblock;
    let _endBlock = req.query.endBlock;
    let _endPoint = req.query.endPoint;

    var istrue = await queryEvent(_startblock,_endBlock,_endPoint);
    console.log("istrue ", istrue)
    res.send(istrue)
});
  
  
app.get('/traverseEvents', async (req, res) => { //to verify the user.
    await traverseEvents();
    //console.log("istrue ", istrue)
    res.send("done")
});




const fetchcurblock = async() => {

  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  console.log("httpProvider")
  const api = await ApiPromise.create({ provider: httpProvider });  
  console.log("api")

  // const lastHdr = await api.rpc.chain.getHeader();
  // console.log("lastHdr.number " , lastHdr.number);


  // retrieve the last header (hash optional)
// const header = await api.derive.chain.getHeader();

// console.log(`#${header.number}: ${header.author}`);
  // const chain  =await api.rpc.system.chain();
  // const lastheader= await api.rpc.chain.getHeader();
  // console.log(lastheader.number.number);

// Retrieve the chain name
const chain = await api.rpc.system.chain();

// Retrieve the latest header
const lastHeader = await api.rpc.chain.getHeader();

console.log("lastHeader.number ", lastHeader.number);

let num ='${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}'
console.log('num is ', num)
// Log the informations
console.log('last block ${lastHeader.number}');

}

//


        

