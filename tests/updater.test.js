const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCommit,
  appendCommit,
} = require("../updater.js");

test("buildCommit() creates a message and matching timestamp", () => {
  const fixedDate = new Date("2026-08-11T10:30:00.000Z");

  const commit = buildCommit(fixedDate);

  assert.equal(commit.time, "2026-08-11 10:30:00");
  assert.equal(commit.message, "I committed at 2026-08-11 10:30:00");
});

test("buildCommit() defaults to the current time when no date is passed", () => {
  const before = Date.now();
  const commit = buildCommit();
  const after = Date.now();

  const commitTime = new Date(commit.time.replace(" ", "T") + "Z").getTime();

  assert.ok(commitTime >= before - 1000 && commitTime <= after + 1000);
});

test("appendCommit() adds a new commit without mutating the original array", () => {
  const original = [{ message: "first", time: "2026-08-11 10:00:00" }];
  const newCommit = { message: "second", time: "2026-08-11 10:00:01" };

  const result = appendCommit(original, newCommit);

  assert.equal(original.length, 1, "original array should be untouched");
  assert.equal(result.length, 2);
  assert.deepEqual(result[1], newCommit);
});
