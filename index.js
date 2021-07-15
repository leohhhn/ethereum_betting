const express = require("express");
const app = express();
const path = require('path');
const matches = require('./src/backend/matches.json');
const fs = require('fs');
const port = process.env.PORT || 3000;

let contractInstance;
let contractOwner;

let current_user_address;
app.use(express.urlencoded({
	extended: false
}));
app.use('/frontend', express.static(__dirname + '/src/frontend'));
app.use('/backend', express.static(__dirname + '/src/backend'));
app.use(express.static(path.join(__dirname, './build/contracts/')));

app.use(express.json());

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/src/frontend/main.html'));
});


app.get('/getmatchesjson', (req, res) => {
	res.json(matches);
});



app.listen(port, () => {
	console.log(`listening on port ${port}...`);
});
