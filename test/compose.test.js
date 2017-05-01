// compose.test.js

const compose = require('../lib/compose.js');
const fs      = require('fs');

const composer = compose(function (data) {
    console.log(data);
})

fs.readFile('test/two.txt', 'utf8', function (err, data) {
    if(err) console.log(err);
    lines = data.split('\n');
    for(i = 0; i < lines.length; i++) {
        composer.handleTextChunk(lines[i]);
    }
});
