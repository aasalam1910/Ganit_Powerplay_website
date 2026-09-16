"use strict";
var blob = require("@vercel/blob");

var KEY = "powerplay-state.json";
var EMPTY = { results: {}, finals: {} };

async function streamToString(stream) {
  var chunks = [];
  for await (var chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks.map(function (c) { return Buffer.isBuffer(c) ? c : Buffer.from(c); })).toString("utf8");
}

async function loadState() {
  try {
    var result = await blob.get(KEY, { access: "private", useCache: false });
    if (!result || !result.stream) return EMPTY;
    var text = await streamToString(result.stream);
    return JSON.parse(text);
  } catch (e) {
    return EMPTY;
  }
}

async function saveState(state) {
  await blob.put(KEY, JSON.stringify(state), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });
}

module.exports = { loadState: loadState, saveState: saveState };
