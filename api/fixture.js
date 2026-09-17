"use strict";
var store = require("../lib/store");

var ALLOWED = { date: true, time: true, extra: true, note: true, teamA: true, teamB: true };

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  var body = req.body || {};
  if (!process.env.POWERPLAY_PIN || body.pin !== process.env.POWERPLAY_PIN) {
    res.status(403).json({ error: "invalid_pin" });
    return;
  }
  if (!body.id) {
    res.status(400).json({ error: "bad_request" });
    return;
  }
  var state = await store.loadState();
  var cur = state.fixtures[body.id] || {};
  var next = Object.assign({}, cur);
  var patch = body.patch || {};
  Object.keys(patch).forEach(function (k) {
    if (!ALLOWED[k]) return;
    if (patch[k] === null || patch[k] === undefined || patch[k] === "") delete next[k];
    else next[k] = String(patch[k]);
  });
  if (Object.keys(next).length === 0) delete state.fixtures[body.id];
  else state.fixtures[body.id] = next;
  await store.saveState(state);
  res.status(200).json({ ok: true });
};
