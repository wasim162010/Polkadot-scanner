const express = require('express'); // Include ExpressJS
const app = express(); // Create an ExpressJS app
const bodyParser = require('body-parser'); // middleware
app.use(bodyParser.urlencoded({ extended: false }));

// const { ApiPromise } = require('@polkadot/api');
// const { HttpProvider } = require('@polkadot/rpc-provider');

// const conn = require('../connect');

// const port = 3000 // Port we will listen on

// Function to listen on the port
app.listen(port, () => console.log(`This app is listening on port ${port}`));







