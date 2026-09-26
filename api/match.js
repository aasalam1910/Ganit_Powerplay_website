"use strict";
var store = require("../lib/store");

var WINNERS = { A: true, B: true, TIE: true };

// {"1":"A","2":"B"} -> same, dropping anything that is not game 1-9 won by A or B.
function sanitizeGames(games) {
  if (!games || typeof games !== "object") return null;
  var out = {};
  var any = false;
  Object.keys(games).forEach(function (k) {
    if (!/^[1-9]$/.test(k)) return;
    if (games[k] !== "A" && games[k] !== "B") return;
    out[k] = games[k];
    any = true;
  });
  return any ? out : null;
}

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
    // Per-game ties (Badminton) send a games map and may have no winner yet,
    // e.g. 1-1 with the decider still to play, so games alone keep the row alive.
    var games = sanitizeGames(body.games);
    var winner = WINNERS[body.winner] ? body.winner : null;
    if (!winner && !games) {
      delete state.results[body.id];
    } else {
      var row = {};
      if (winner) row.winner = winner;
      if (games) row.games = games;
      state.results[body.id] = row;
    }
    await store.saveState(state);
  } catch (e) {
    res.status(503).json({ error: "storage_unavailable", detail: String((e && e.message) || e) });
    return;
  }
  res.status(200).json({ ok: true });
};
