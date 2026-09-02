import assert from "node:assert/strict";
import { test } from "node:test";

import { exportJWK, generateKeyPair, SignJWT } from "jose";

import { validateCloudflareAccess } from "./cloudflare-access.ts";

const TEAM_DOMAIN = "https://example.cloudflareaccess.com";
const POLICY_AUD = "application-audience";
const env = { POLICY_AUD, TEAM_DOMAIN };

const { privateKey, publicKey } = await generateKeyPair("RS256", { extractable: true });
const publicJwk = {
  ...await exportJWK(publicKey),
  alg: "RS256",
  kid: "test-key",
  use: "sig",
};

const fetchJwks = async (url) => {
  assert.equal(url, `${TEAM_DOMAIN}/cdn-cgi/access/certs`);
  return Response.json({ keys: [publicJwk] });
};

const createToken = ({ audience = POLICY_AUD, expirationTime = "5m" } = {}) =>
  new SignJWT({ email: "user@example.com", type: "app" })
    .setProtectedHeader({ alg: "RS256", kid: publicJwk.kid })
    .setIssuer(TEAM_DOMAIN)
    .setAudience(audience)
    .setIssuedAt()
    .setNotBefore(0)
    .setExpirationTime(expirationTime)
    .sign(privateKey);

const createRequest = (token) =>
  new Request("https://sender.example.com", {
    headers: token ? { "Cf-Access-Jwt-Assertion": token } : undefined,
  });

test("accepts a correctly signed Access token", async () => {
  const result = await validateCloudflareAccess(createRequest(await createToken()), env, fetchJwks);

  assert.equal(result.authenticated, true);
  assert.equal(result.authenticated && result.claims.email, "user@example.com");
});

test("rejects requests without an Access token", async () => {
  const result = await validateCloudflareAccess(createRequest(), env, fetchJwks);

  assert.deepEqual(result, { authenticated: false, reason: "missing_token" });
});

test("rejects tokens issued for a different application", async () => {
  const result = await validateCloudflareAccess(
    createRequest(await createToken({ audience: "another-application" })),
    env,
    fetchJwks,
  );

  assert.deepEqual(result, { authenticated: false, reason: "invalid_token" });
});

test("rejects expired tokens", async () => {
  const result = await validateCloudflareAccess(
    createRequest(await createToken({ expirationTime: 0 })),
    env,
    fetchJwks,
  );

  assert.deepEqual(result, { authenticated: false, reason: "invalid_token" });
});

test("fails closed when Access configuration is absent or invalid", async () => {
  assert.deepEqual(await validateCloudflareAccess(createRequest(await createToken()), undefined, fetchJwks), {
    authenticated: false,
    reason: "missing_configuration",
  });
  assert.deepEqual(
    await validateCloudflareAccess(
      createRequest(await createToken()),
      { POLICY_AUD, TEAM_DOMAIN: "https://example.com" },
      fetchJwks,
    ),
    { authenticated: false, reason: "invalid_configuration" },
  );
});
