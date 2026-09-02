import { createRemoteJWKSet, customFetch, type FetchImplementation, type JWTPayload, jwtVerify } from "jose";

const ACCESS_TOKEN_HEADER = "cf-access-jwt-assertion";
const ACCESS_DOMAIN_SUFFIX = ".cloudflareaccess.com";

type AccessEnvironment = Readonly<{
  POLICY_AUD: string;
  TEAM_DOMAIN: string;
}>;

type AccessFailureReason = "invalid_configuration" | "invalid_token" | "missing_configuration" | "missing_token";

export type AccessValidationResult =
  | { authenticated: true; claims: JWTPayload }
  | { authenticated: false; reason: AccessFailureReason };

const getTeamDomain = (value: string) => {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      !url.hostname.endsWith(ACCESS_DOMAIN_SUFFIX)
    ) {
      return undefined;
    }

    return url.origin;
  } catch {
    return undefined;
  }
};

export const validateCloudflareAccess = async (
  request: Request,
  env: AccessEnvironment | undefined,
  fetchImplementation?: FetchImplementation,
): Promise<AccessValidationResult> => {
  const audience = env?.POLICY_AUD.trim();
  const configuredTeamDomain = env?.TEAM_DOMAIN.trim();

  if (!audience || !configuredTeamDomain) {
    return { authenticated: false, reason: "missing_configuration" };
  }

  const teamDomain = getTeamDomain(configuredTeamDomain);
  if (!teamDomain) {
    return { authenticated: false, reason: "invalid_configuration" };
  }

  const token = request.headers.get(ACCESS_TOKEN_HEADER);
  if (!token) {
    return { authenticated: false, reason: "missing_token" };
  }

  try {
    const keySet = createRemoteJWKSet(
      new URL("/cdn-cgi/access/certs", teamDomain),
      fetchImplementation ? { [customFetch]: fetchImplementation } : undefined,
    );
    const { payload } = await jwtVerify(token, keySet, {
      algorithms: ["RS256"],
      audience,
      issuer: teamDomain,
      requiredClaims: ["exp"],
    });

    return { authenticated: true, claims: payload };
  } catch {
    return { authenticated: false, reason: "invalid_token" };
  }
};
