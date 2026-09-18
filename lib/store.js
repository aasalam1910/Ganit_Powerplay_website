"use strict";
// State lives in one row of a Supabase table:
//   create table powerplay_state (id text primary key, data jsonb not null, updated_at timestamptz default now());
// Env vars required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

var ROW_ID = "main";
var CACHE_TTL_MS = 5000; // serve repeated reads from memory briefly

var cache = { state: null, at: 0 };

function empty() {
  return { results: {}, finals: {}, fixtures: {}, rosters: {} };
}

function cfg() {
  var url = process.env.SUPABASE_URL;
  var key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  return { base: url.replace(/\/$/, "") + "/rest/v1/powerplay_state", key: key };
}

function headers(c, extra) {
  return Object.assign({
    "apikey": c.key,
    "Authorization": "Bearer " + c.key,
    "Content-Type": "application/json"
  }, extra || {});
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

// Throws on backend failure so callers return an error instead of an empty state.
async function loadState(opts) {
  var fresh = opts && opts.fresh;
  if (!fresh && cache.state && Date.now() - cache.at < CACHE_TTL_MS) return clone(cache.state);
  var c = cfg();
  var r = await fetch(c.base + "?id=eq." + ROW_ID + "&select=data", { headers: headers(c) });
  if (!r.ok) throw new Error("Supabase read failed: " + r.status + " " + (await r.text()).slice(0, 200));
  var rows = await r.json();
  var state = Object.assign(empty(), (rows[0] && rows[0].data) || {});
  cache = { state: state, at: Date.now() };
  return clone(state);
}

async function saveState(state) {
  var c = cfg();
  var r = await fetch(c.base, {
    method: "POST",
    headers: headers(c, { "Prefer": "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({ id: ROW_ID, data: state, updated_at: new Date().toISOString() })
  });
  if (!r.ok) throw new Error("Supabase write failed: " + r.status + " " + (await r.text()).slice(0, 200));
  cache = { state: state, at: Date.now() };
}

module.exports = { loadState: loadState, saveState: saveState, empty: empty };
