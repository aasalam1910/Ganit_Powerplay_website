"use strict";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  var id = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "";
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ id: id });
};
