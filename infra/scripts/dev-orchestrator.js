#!/usr/bin/env node

const { execSync, spawn } = require("child_process");

execSync("npm run services:up", { stdio: "inherit" });
execSync("npm run services:wait:database", { stdio: "inherit" });
execSync("npm run migrations:up", { stdio: "inherit" });

const next = spawn("next", ["dev"], { stdio: "inherit" });

process.on("SIGINT", () => {
  console.log("\nStopping Docker...");
  execSync("npm run services:stop", { stdio: "inherit" });
  process.exit(130);
});

next.on("close", (code) => {
  execSync("npm run services:stop", { stdio: "inherit" });
  process.exit(code);
});
