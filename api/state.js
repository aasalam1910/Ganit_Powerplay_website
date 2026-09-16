"use strict";
var store = require("../lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  var state = await store.loadState();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(state);
};
