"use strict";

importScripts("vendor/sql-wasm-browser.js");
const engine = initSqlJs({
  locateFile: name => new URL("vendor/" + name, self.location.href).href
});

const seal = [[59,49,60,58],[38,110,105,105],[105,109,106,110],[106,108,111,32]];
let db;

function single(sql, args = []) {
  const stmt = db.prepare(sql, args);
  try {
    return stmt.step() ? stmt.get() : null;
  } finally {
    stmt.free();
  }
}

function seed(SQL) {
  if (db) db.close();
  db = new SQL.Database();
  const suffix = crypto.getRandomValues(new Uint16Array(1))[0].toString(16).padStart(4, "0");
  const vault = "vault_" + suffix;
  db.run(`
    CREATE TABLE archive (tag TEXT NOT NULL, shelf TEXT NOT NULL);
    INSERT INTO archive VALUES ('weekly', 'public'), ('incident', 'public'), ('handover', 'sealed');
    CREATE TABLE report_settings (id INTEGER PRIMARY KEY, tag TEXT NOT NULL);
    INSERT INTO report_settings VALUES (1, 'weekly');
    CREATE TABLE seal_manifest (
      edition INTEGER PRIMARY KEY,
      state TEXT NOT NULL CHECK (state IN ('superseded', 'active'))
    );
    INSERT INTO seal_manifest VALUES (12, 'superseded'), (17, 'active'), (21, 'superseded');
    CREATE TABLE ${vault} (
      edition INTEGER NOT NULL REFERENCES seal_manifest(edition),
      position INTEGER NOT NULL,
      fragment TEXT NOT NULL,
      PRIMARY KEY (edition, position)
    );
  `);
  const live = seal.map(piece => String.fromCharCode(...piece.map(code => code ^ 93)));
  for (const [edition, fragments] of [
    [12, ["flag", "{826", "1049", "735}"]],
    [17, live],
    [21, ["flag", "{190", "4376", "258}"]]
  ]) {
    for (const index of [2, 0, 3, 1]) {
      db.run(`INSERT INTO ${vault} VALUES (?, ?, ?)`, [edition, index + 1, fragments[index]]);
    }
  }
  return {kind: "ready"};
}

function run(op, value) {
  if (!db) throw new Error("Not initialized");
  if (op === "preview" || op === "save") {
    if (typeof value !== "string" || value.length < 1 || value.length > 600 ||
        /[;\x00-\x1f]|\b(?:select|union) +/i.test(value)) {
      return {kind: "rejected"};
    }
    if (op === "preview") {
      const result = single("SELECT 1 FROM archive WHERE tag = ? AND shelf = 'public' LIMIT 1", [value]);
      return {kind: result ? "hit" : "miss"};
    }
    db.run("UPDATE report_settings SET tag = ? WHERE id = 1", [value]);
    return {kind: "saved"};
  }
  if (op === "replay") {
    const [tag] = single("SELECT tag FROM report_settings WHERE id = 1");
    db.run("PRAGMA query_only = ON");
    try {
      // Intentional vulnerability: the legacy query interpolates a saved setting.
      const hit = single(`SELECT 1 FROM archive WHERE tag = '${tag}' AND shelf = 'public' LIMIT 1`);
      return {kind: hit ? "hit" : "miss"};
    } catch {
      return {kind: "miss"};
    } finally {
      db.run("PRAGMA query_only = OFF");
    }
  }
  if (op === "verify") {
    const expected = seal.flat().map(code => String.fromCharCode(code ^ 93)).join("");
    return {kind: value === expected ? "correct" : "wrong"};
  }
  throw new Error("Unknown operation");
}

self.onmessage = async ({data}) => {
  const {id, op, value} = data;
  try {
    const SQL = await engine;
    const result = op === "reset" ? seed(SQL) : run(op, value);
    self.postMessage({id, ...result});
  } catch {
    self.postMessage({id, kind: "error"});
  }
};
