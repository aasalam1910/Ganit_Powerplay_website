"use strict";
var store = require("../lib/store");

var ALLOWED = { date: true, time: true, extra: true, note: true, teamA: true, teamB: true, playersA: true, playersB: true };
// Per-game player names for multi-game ties: g1A, g1B, g2A, ... up to 9 games.
var GAME_KEY = /^g[1-9][AB]$/;
function allowedKey(k) { return ALLOWED[k] === true || GAME_KEY.test(k); }

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
  try {
    var state = await store.loadState({ fresh: true });
    var cur = state.fixtures[body.id] || {};
    var next = Object.assign({}, cur);
    var patch = body.patch || {};
    Object.keys(patch).forEach(function (k) {
      if (!allowedKey(k)) return;
      if (patch[k] === null || patch[k] === undefined || patch[k] === "") delete next[k];
      else next[k] = String(patch[k]);
    });
    if (Object.keys(next).length === 0) delete state.fixtures[body.id];
    else state.fixtures[body.id] = next;
    await store.saveState(state);
  } catch (e) {
    res.status(503).json({ error: "storage_unavailable", detail: String((e && e.message) || e) });
    return;
  }
  res.status(200).json({ ok: true });
};
