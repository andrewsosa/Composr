/**
 * Copyright 2017 Andrew Sosa
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var compose = {
    states: {},
    data: [],
    active_paragraph: [],
    active_sentence: ''
};

const data = compose.data;

// Queue to process tokens as they arrive
const async = require('async');
const q = async.queue(function(token, callback) {
  compose.onToken(token);
  callback();
});

q.drain = function() {
  console.log('queue empty!');
}

// Split incoming text, pass to queue
compose.handleTextChunk = function (text) {
  const tokens = text.split(' ');
  tokens.map(i => q.push(i));
}

compose.onToken = function (token) {
  console.log(compose.state);
  compose.state(token);
}

compose.log = function (token) {
  console.log(token);
}


/*
 *  State handlers
 */

// begin
compose.states.init = function (token) {
  if(token == 'begin')
    compose.state = compose.states.default;
}

// stop, new->paragraph
compose.states.default = function (token) {
  if(token == 'stop')
    compose.state = compose.states.init;
  else if(token == 'new')
    compose.state = compose.states.S0;
}

// stop, new->sentence, next->sentence
compose.states.paragraph = function (token) {
  if(token == 'new' || token == 'next')
    compose.state = compose.states.S2;
  else if(token == 'stop')
    compose.state = compose.states.default;
}

compose.states.sentence = function (token) {
  if(token == 'okay') {
    compose.active_paragraph.push(compose.active_sentence);
  }
}

// new->paragraph, *
compose.states.S0 = function (token) {
  if(token == 'paragraph') {
    compose.state = compose.states.paragraph;
    // refresh the new paragraph
    compose.active_paragraph = {};
  }
  else
    compose.state = compose.states.default;
}

// command->?, literal->?, *
compose.states.S1 = function (token) {
  if(token == 'end') {
    compose.state = compose.states.paragraph;
  }
  else {
    compose.callback(token);
  }

}

// new->sentence, *
compose.states.S2 = function (token) {
  if(token == 'sentence') {
    compose.state = compose.states.sentence;
    // refresh new sentence
    compose.active_sentence = {};
  }
  else
    compose.state = compose.states.paragraph;
}

// Begin in default state
compose.state = compose.states.init;


module.exports = function (callback) {
  compose.callback = callback;
  return compose;
};
