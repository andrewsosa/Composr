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
    active_sentence: []
};

const data = compose.data;

// Queue to process tokens as they arrive
const async = require('async');
const q = async.queue(function(token, callback) {
  compose.onToken(token);
  callback();
});

q.drain = function() {
  compose.log('queue empty!');
}

// Split incoming text, pass to queue
compose.handleTextChunk = function (text) {
  const tokens = text.split(' ');
  tokens.map(i => q.push(i.toLowerCase()));
}

compose.onToken = function (token) {
  compose.state(token);
}

compose.log = function (token) {
  console.log(token);
}


/*
 *  State handlers
 */

// first|next -> S0
compose.states.default = function (token) {
  compose.log('default');

  if(token == 'next' || token == 'first')
    compose.state = compose.states.S0;
}

// paragraph -> paragraph; * ->default
compose.states.S0 = function (token) {
  compose.log('S0');

  // Going to create a new paragraph
  if(token == 'paragraph') {

    // Refresh to new paragraph
    compose.active_paragraph = []

    // Transition to state
    compose.state = compose.states.paragraph;
  }
  else {
    compose.state = compose.states.default;
  }
}

// new|next -> S2; stop -> default
compose.states.paragraph = function (token) {
  compose.log('paragraph');

  if(token == 'new' || token == 'next')
    compose.state = compose.states.S2;
  else
  if(token == 'stop') {

    // Store old paragraph
    if (compose.active_paragraph.length > 0) {
      compose.data.push(compose.active_paragraph)
    }

    compose.callback(compose);
    compose.state = compose.states.default;
  }
}


compose.states.S2 = function (token) {
  compose.log('S2');
  if(token == 'sentence') {
    compose.state = compose.states.sentence;
    // refresh new sentence
    compose.active_sentence = [];
  }
  else {
    compose.state = compose.states.paragraph;
  }
}

//
compose.states.sentence = function (token) {
  compose.log('sentence');
  if(token == 'okay') {
    compose.active_paragraph.push(compose.active_sentence);
    compose.callback(compose);
    compose.state = compose.states.paragraph;
  }
  else
  if(token == 'start') {
    compose.state = compose.states.S1;
  }
}

// command->?, literal->?, *
compose.states.S1 = function (token) {
  compose.log('S1');
  if(token == 'stop') {
    compose.state = compose.states.sentence;
  }
  else {
    compose.active_sentence.push(token);
    compose.callback(compose);
  }

}

// start in default state
compose.state = compose.states.default;


module.exports = function (callback) {
  compose.callback = callback;
  return compose;
};
