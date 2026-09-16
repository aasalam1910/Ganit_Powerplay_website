"use strict";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  var body = req.body || {};
  var ok = !!process.env.POWERPLAY_PIN && body.pin === process.env.POWERPLAY_PIN;
  res.status(200).json({ ok: ok });
};
