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

  console.log("calling verify")
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
      return true
  } catch (error) {

    return false;
  }


}

const queryEvent = async () => { //to verify the user.

  console.log("httpProvider")
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  console.log("httpProvider")
  const api = await ApiPromise.create({ provider: httpProvider });  
  console.log("api")

  const height = 4626906;
  const blockHash = await api.rpc.chain.getBlockHash(height);

  console.log("blockHash ", blockHash)

  console.log("calling queryEvent")
  const events = await api.query.system.events.at(blockHash);
  await api.query.system.events.query
  events.forEach((event, index) => {
    console.log(`Event ${index}: `, event.event.toHuman());
  });
    return true;
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



// res.sendFile(__dirname + '/static/login.html');
  app.get('/queryEvent', async (req, res) => { //to verify the user.
    var istrue = await queryEvent();
    console.log("istrue ", istrue)
    res.send(istrue)
  });
  
  
  app.get('/traverseEvents', async (req, res) => { //to verify the user.
    await traverseEvents();
    //console.log("istrue ", istrue)
    res.send("done")
  });


  app.get('/', async (req, res) => { //to verify the user.
    
    res.sendFile(__dirname + '/UI/static/index.html');
});


// Route to Login Page
app.get('/login',  async (req, res) => {
  res.sendFile(__dirname + '/UI/static/login.html');
});

app.post('/login', async (req, res) => {
  // Insert Login Code Here
  let username = req.body.username;
  var istrue = await verify(username);
  if(istrue) {
    res.sendFile(__dirname + '/UI/homepage.html');
  } else {
  res.send(`Enter correct user name`);
  }
});


        

