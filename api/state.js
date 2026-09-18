"use strict";
var store = require("../lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  try {
    var state = await store.loadState();
    res.status(200).json(state);
  } catch (e) {
    res.status(503).json({ error: "storage_unavailable", detail: String((e && e.message) || e) });
  }
};
