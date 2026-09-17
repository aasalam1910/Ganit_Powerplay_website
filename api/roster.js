"use strict";
var store = require("../lib/store");

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
  if (!body.team) {
    res.status(400).json({ error: "bad_request" });
    return;
  }
  var state = await store.loadState();
  var cur = state.rosters[body.team] || {};
  var next = Object.assign({}, cur);
  var patch = body.patch || {};
  if ("name" in patch) {
    if (!patch.name) delete next.name;
    else next.name = String(patch.name);
  }
  if ("members" in patch) {
    if (!Array.isArray(patch.members) || patch.members.length === 0) delete next.members;
    else next.members = patch.members.map(String).filter(Boolean);
  }
  if (Object.keys(next).length === 0) delete state.rosters[body.team];
  else state.rosters[body.team] = next;
  await store.saveState(state);
  res.status(200).json({ ok: true });
};
