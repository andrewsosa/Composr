// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const recognize = require('./lib/recognize');
const compose   = require('./lib/compose');
const fs        = require('fs');
const $         = require('jquery');

const $content   = $('.content');
const $paragraph = $('#active_paragraph');
const $sentence  = $('#active_sentence');

// Structure content
const paragraphs = {};
const content = {};

content.update = function (payload) {

    // Render active sentence
    $sentence.text(payload.active_sentence.join(' ') + '.')

    // Render active paragraph
    let active_paragraph = payload.active_paragraph
    let paragraph_content = ''
    for (i = 0; i < active_paragraph.length; i++) {
        paragraph_content += active_paragraph[i].join(' ') + '. '
    }
    $paragraph.text(paragraph_content)

    $content.html("")

    // Render the whole data
    let text = payload.data

    for (i = 0; i < text.length; i++) {
        let par = text[i]
        let content = ''

        paragraphs.i = $("<p>", {id:i})

        for (j = 0; j < par.length; j++) {
            let sentence = par[j].join(' ') + '. '
            content += sentence
        }

        // if($(`#${i}`) === undefined)
        $content.append(paragraphs.i)

        paragraphs.i.text(content)

    }

}

// Do recognition
composer = compose(data => content.update(data));


// $('.record').on('click', () => {
//
//     recognize(function (chunk) {
//         console.log(`chunk ${chunk}`);
//         composer.handleTextChunk(chunk);
//     });
//
// });


fs.readFile('test/two.txt', 'utf8', function (err, data) {
    if(err) console.log(err);
    lines = data.split('\n');
    // console.log(lines);
    for(i = 0; i < lines.length; i++) {
        composer.handleTextChunk(lines[i]);
    }
});
