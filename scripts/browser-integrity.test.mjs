/**
 * Adversarial tests for the browser-integrity signal and its verification integration.
 *
 *   run: node --experimental-strip-types scripts/browser-integrity.test.mjs
 *
 * Node's type-stripping imports the real TypeScript modules, so these assertions run against
 * the shipped source, not a copy. The point of this file is the three invariants that make the
 * feature safe rather than merely described as safe:
 *   1. it cannot reject anyone (advisory, warnings-only, capped);
 *   2. it retains nothing reconstructable about a device;
 *   3. it cannot be quietly switched off by a rename or a refactor.
 * Each is asserted against source text where no runtime path exists to observe it — and where a
 * source assertion is used, an accompanying assertion proves the extraction found anything at
 * all, because an instrument that reads nothing passes every subset test forever.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const {
  evaluateIntegrity,
  persistableDetail,
  riskContribution,
  riskSignals,
  memberVisibleFactors,
  NEVER_COLLECTED,
} = await import("../web/src/lib/security/browser-integrity.ts");

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const HONEST = {
  timezoneOffsetMinutes: 300,
  language: "en-US",
  maxTouchPoints: 0,
  claimedPlatform: "Windows",
  hasCameraApi: true,
  hasPermissionsApi: true,
  secureContext: true,
};
const HONEST_CTX = {
  acceptLanguage: "en-US,en;q=0.9",
  userAgent: CHROME_UA,
  secChUaPlatform: '"Windows"',
  secChUa: '"Chromium";v="131", "Google Chrome";v="131"',
};

test("an ordinary browser in the ordinary place evaluates to nothing", () => {
  const r = evaluateIntegrity(HONEST, HONEST_CTX);
  assert.equal(r.count, 0, `fired: ${persistableDetail(r)}`);
  assert.equal(persistableDetail(r), "none");
  for (const offset of [0, 60, 120, 180, 240, 300, 420, 480]) {
    assert.equal(evaluateIntegrity({ ...HONEST, timezoneOffsetMinutes: offset }, HONEST_CTX).count, 0);
  }
});

test("missing information yields no opinion, never a suspicion", () => {
  assert.equal(evaluateIntegrity({}, {}).count, 0, "empty observations and empty headers");
  assert.equal(evaluateIntegrity(HONEST, {}).count, 0, "no headers at all: nothing to contradict");
  assert.equal(evaluateIntegrity({}, HONEST_CTX).count, 0, "no observations: nothing to contradict");
  // A lone star is "no preference" (curl, and privacy extensions that strip the header).
  assert.equal(
    evaluateIntegrity({ ...HONEST, timezoneOffsetMinutes: -120 }, { ...HONEST_CTX, acceptLanguage: "*" })
      .count,
    0,
    "wildcard Accept-Language must not be read as an explicit US list"
  );
  // Firefox and older Safari send no Client Hints; that is not evidence of anything. The
  // platform claim must also be the true one for that OS - HONEST claims Windows, which really
  // would contradict a Mac UA, so this case overrides it rather than reusing the fixture blind.
  assert.equal(
    evaluateIntegrity({ ...HONEST, claimedPlatform: "macOS" }, {
      acceptLanguage: "en-US,en;q=0.9",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:131.0) Gecko/20100101 Firefox/131.0",
      secChUaPlatform: null,
      secChUa: null,
    }).count,
    0,
    "a non-Chrome UA without hints must not fire"
  );
});

test("a traveller, an expat and a developer are not suspicious", () => {
  // Mixed language list: legitimate everywhere, so the clock check stays silent.
  assert.equal(
    evaluateIntegrity({ ...HONEST, timezoneOffsetMinutes: -120 }, { ...HONEST_CTX, acceptLanguage: "en-US,en;q=0.9,de;q=0.8" })
      .count,
    0
  );
  // A German browser on a German clock, consistently reported.
  assert.equal(
    evaluateIntegrity(
      { ...HONEST, timezoneOffsetMinutes: -60, language: "de-DE", claimedPlatform: "macOS" },
      { acceptLanguage: "de-DE,de;q=0.9", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15", secChUaPlatform: '"macOS"', secChUa: null }
    ).count,
    0
  );
});

test("a crafted client fires the checks it should", () => {
  const r = evaluateIntegrity(
    { ...HONEST, timezoneOffsetMinutes: -120, language: "zh-CN", claimedPlatform: "iOS" },
    {
      acceptLanguage: "en-US,en;q=0.9",
      userAgent: "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
      secChUaPlatform: '"iOS"',
      secChUa: null,
    }
  );
  const keys = r.fired.map((f) => f.key);
  assert.ok(r.count >= 2, `expected at least two factors, got ${keys.join(",")}`);
  assert.ok(keys.includes("tzVsAcceptLanguage"), "clock outside the claimed language range");
  assert.ok(keys.includes("languageNotInAcceptLanguage"), "navigator.language absent from the header");
});

test("the platform check fires on a real contradiction and stays quiet on a missing header", () => {
  const contradicts = evaluateIntegrity(
    { ...HONEST, claimedPlatform: "Android" },
    { ...HONEST_CTX, secChUaPlatform: '"iOS"' }
  );
  assert.ok(contradicts.fired.some((f) => f.key === "platformContradictsUserAgent"));
  const agrees = evaluateIntegrity({ ...HONEST, claimedPlatform: "Windows" }, HONEST_CTX);
  assert.equal(agrees.count, 0, "quoted header values must be unquoted before comparison");
  const noHeader = evaluateIntegrity(
    { ...HONEST, claimedPlatform: "iOS" },
    { ...HONEST_CTX, secChUaPlatform: null, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" }
  );
  assert.equal(noHeader.count, 0, "a claim consistent with the UA is not a contradiction");
});

test("advisory is structural, not a convention", () => {
  for (const input of [
    evaluateIntegrity(HONEST, HONEST_CTX),
    evaluateIntegrity({}, {}),
    evaluateIntegrity({ timezoneOffsetMinutes: -120, language: "zh-CN", claimedPlatform: "iOS" }, {
      acceptLanguage: "en-US",
      userAgent: "Chrome/131",
      secChUaPlatform: '"iOS"',
    }),
  ]) {
    assert.equal(input.advisory, true);
  }
});

test("only rule names are retained; the observations are dropped", () => {
  const detail = persistableDetail(
    evaluateIntegrity({ timezoneOffsetMinutes: -120, language: "zh-CN", claimedPlatform: "iOS", maxTouchPoints: 5 }, {
      acceptLanguage: "en-US,en;q=0.9",
      userAgent: CHROME_UA,
      secChUaPlatform: '"iOS"',
      secChUa: null,
    })
  );
  assert.match(detail, /^[a-zA-Z][\w]*(,[a-zA-Z][\w]*)*$/);
  assert.ok(!/-120|zh-CN|iPhone|Android|Windows|Mozilla|SM-G991B/.test(detail), `detail leaked a value: ${detail}`);
});

test("risk contribution is capped and cannot dominate the blocking signals", () => {
  let prev = -1;
  for (let n = 0; n <= 12; n++) {
    const r = { fired: Array.from({ length: n }, (_, i) => ({ key: "tzVsAcceptLanguage", label: `#${i}` })), count: n, advisory: true };
    const c = riskContribution(r);
    assert.ok(c >= prev, "score must grow monotonically with factors");
    prev = c;
    assert.ok(c <= 6, `capped at 6, got ${c}`);
  }
  const many = { fired: Array.from({ length: 48 }, () => ({ key: "tzVsAcceptLanguage", label: "x" })), count: 48, advisory: true };
  // One failed verification in the same table costs 40; a full week of 48 suspicious
  // attempts must still weigh less than a single hard signal.
  assert.ok(riskContribution(many) < 40, `integrity cap ${riskContribution(many)} must stay below one hard failure`);
  const sig = riskSignals(many);
  assert.equal(sig.browserIntegrityFactorCount, 48);
  assert.equal(sig.browserIntegrityFactorKeys.length, 48);
});

test("investigative factors are withheld from the member", () => {
  const r = evaluateIntegrity({ timezoneOffsetMinutes: -120, language: "zh-CN", claimedPlatform: "iOS" }, {
    acceptLanguage: "en-US",
    userAgent: "Chrome/131",
    secChUaPlatform: '"iOS"',
    secChUa: null,
  });
  const visible = memberVisibleFactors(r).map((f) => f.key);
  assert.ok(!visible.includes("platformContradictsUserAgent"), "do not tell a caller which header to forge");
  assert.ok(!visible.includes("chromeWithoutClientHints"), "do not tell a caller which header is missing");
});

test("the module is pure: no imports, so it cannot reach the browser, db or network", () => {
  const src = read("../web/src/lib/security/browser-integrity.ts");
  /* Comments are stripped before the forbidden-token scan. This module documents the very APIs
     it refuses to read ("no canvas read, no localStorage"), so a naive scan of the whole file
     fails on the disclaimer — a guard that cannot tell a refusal from a usage is worse than none,
     because the next person "fixes" it by deleting the honest comment. */
  let code = src
    .replace(/export const NEVER_COLLECTED = [\s\S]*?as const;/, "") // the refusal list itself
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !/^\s*\/\//.test(l))
    .join("\n");
  assert.ok(code.length > 1200, `comment-stripping found only ${code.length} chars — the extraction is broken, not the module`);
  assert.ok(!/^\s*import\s/m.test(code), "browser-integrity.ts must import nothing");
  assert.ok(!/\bfetch\(|process\.env|Date\.now|Math\.random|crypto\.|\brequire\(/.test(code),
    "no I/O, clock, randomness or module loading in the evaluator");
  for (const banned of ["localStorage", "AsyncStorage", "document.cookie", "getContext", "webgl"]) {
    assert.ok(!code.includes(banned), `evaluator must not reference ${banned}`);
  }
});

test("the client collector reads only the seven allowed fields", () => {
  const src = read("../web/src/lib/security/browser-integrity-client.ts");
  const body = src.slice(src.indexOf("export function browserObservations"));
  assert.ok(body.length > 200, "collector body found");
  const forbidden = NEVER_COLLECTED.filter(
    (needle) => new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(body)
  );
  assert.deepEqual(forbidden, [], `collector touches ${forbidden.join(",")}`);
  assert.ok(!/\bcanvas\b|\bwebgl\b|\bfonts\b|\bplugins\b|deviceMemory|hardwareConcurrency/i.test(body),
    "no fingerprinting API in the collector");
  assert.ok(!/\bset\b.*cookie/i.test(src), "the collector must not write cookies");
});

test("the signal cannot open a hard failure in the risk engine", () => {
  const src = read("../web/src/lib/verification/verification-risk-engine.ts");
  /* Assert on the ARGUMENT of every hard failure, not on statement order. An earlier version of
     this guard sliced between `browserIntegrityFactorCount` and the next `const retries`, which
     silently skipped the push that appeared above the marker and passed a real mutation. */
  const hard = [...src.matchAll(/hardRiskFailures\.push\(\s*([\s\S]{0,120}?)\s*\)/g)].map((m) => m[1]);
  assert.ok(hard.length >= 5, `extraction found only ${hard.length} hard failures — the guard is broken`);
  for (const arg of hard) {
    assert.ok(!/integrity|browserIntegrity|self-report/i.test(arg),
      `a hard failure now mentions the advisory signal: ${arg.slice(0, 60)}`);
  }
  const warn = [...src.matchAll(/riskWarnings\.push\(\s*([\s\S]{0,160}?)\s*\)/g)].map((m) => m[1]);
  assert.ok(warn.some((a) => /integrity|self-report/i.test(a)), "the signal must surface as a warning");
  assert.ok(/Math\.min\(\s*6\s*,/.test(src), "and must stay capped at 6 points");
});

test("the route persists rule names only, and never the raw observations", () => {
  const src = read("../web/src/lib/profile/actions.ts");
  const block = src.slice(src.indexOf('kind: "browser-integrity-contradiction"') - 400, src.indexOf('kind: "browser-integrity-contradiction"') + 200);
  assert.ok(block.includes("persistableDetail(integrity)"), "the event row must be written via persistableDetail");
  assert.ok(!/detail:\s*JSON\.stringify/.test(src), "no raw observation object may be persisted anywhere in the action");
  assert.ok(!/detail:\s*observations/.test(src), "and not the observations verbatim");
});

test("pose authority: a submission with no server challenge is refused", () => {
  const src = read("../web/src/lib/profile/actions.ts");
  assert.ok(/else\s*\{[\s\S]{0,400}Request a verification challenge first/.test(src),
    "the no-token branch must refuse, not fall back to the client's pose");
  assert.ok(!/const isFreshTimestamp = true/.test(src),
    "freshness must not be hard-coded true (that made the engine's expiry branch dead code)");
  assert.ok(/getVerificationPose\(challenge\.poseId\)/.test(src), "the server's pose must be authoritative");
  assert.ok(!/if \(overridePose\) pose = overridePose/.test(src),
    "an unresolvable server pose must not silently leave the client's pose in place");
  const flow = read("../web/src/components/app/verification-flow.tsx");
  const effect = flow.slice(flow.indexOf("assignVerificationChallengeAction"), flow.indexOf("assignVerificationChallengeAction") + 2000);
  assert.ok(!/else\s*\{[^}]*setChallenge\(generateVerificationChallenge/.test(effect),
    "the flow must not mint a challenge the server never issued");
});

test("the migration is additive and touches no existing table", () => {
  const sql = read("../supabase/migrations/20261029120000_browser_integrity_events.sql");
  assert.ok(/create table if not exists public\.freeborn_security_events/.test(sql));
  assert.ok(!/drop column|drop table|alter table public\.verification_challenges/.test(sql),
    "must not redefine canonical's pose table, which already has its own migration");
  assert.match(sql, /revoke all on public\.freeborn_security_events from anon, authenticated/);
  assert.ok(!/for update|for delete/.test(sql), "append-only: no update or delete policy");
  assert.ok(/references public\.user_profiles\(id\) on delete cascade/.test(sql));
});

test("the event row is written unconditionally, including the clean outcome", () => {
  const src = read("../web/src/lib/profile/actions.ts");
  const i = src.indexOf("freeborn_security_events");
  assert.ok(i > 0, "insert present");
  const before = src.slice(Math.max(0, i - 300), i);
  assert.ok(!/if \(integrity\.count > 0\)/.test(before),
    "a conditional write erases the difference between checked-and-clear and never-checked");
});
