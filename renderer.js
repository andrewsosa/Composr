// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const recognize = require('./lib/recognize');
const compose   = require('./lib/compose');

let $ = require('jquery');
let body = $('body');

body.text('Hello, world!');

// Structure content
const content = {};

content.update = function (data) {

}

// Do recognition
composer = compose(data => content.update(data));

recognize(function (chunk) {
    console.log(`chunk ${chunk}`);
    composer.handleTextChunk(chunk);
});
