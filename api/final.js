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
  if (!body.sport) {
    res.status(400).json({ error: "bad_request" });
    return;
  }
  try {
    var state = await store.loadState({ fresh: true });
    var cur = state.finals[body.sport] || {};
    var next = Object.assign({}, cur, body.patch || {});
    Object.keys(next).forEach(function (k) {
      if (next[k] === null || next[k] === undefined) delete next[k];
    });
    state.finals[body.sport] = next;
    await store.saveState(state);
  } catch (e) {
    res.status(503).json({ error: "storage_unavailable", detail: String((e && e.message) || e) });
    return;
  }
  res.status(200).json({ ok: true });
};
