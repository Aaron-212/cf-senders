import { dev } from "$app/environment";
import { error, type Handle } from "@sveltejs/kit";

import { validateCloudflareAccess } from "@/lib/server/cloudflare-access";

const ERROR_MESSAGES: Readonly<Record<number, string>> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  413: "Content Too Large",
  415: "Unsupported Media Type",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

export const handle: Handle = async ({ event, resolve }) => {
  if (event.route.id === null) {
    error(404, "Not Found");
  }

  if (dev) {
    event.locals.access = {
      sub: "local-development",
      email: "local@localhost",
    };
  } else {
    const access = await validateCloudflareAccess(event.request, event.platform?.env);

    if (!access.authenticated) {
      console.warn(
        JSON.stringify({
          message: "Cloudflare Access authentication failed",
          path: event.url.pathname,
          reason: access.reason,
        }),
      );

      error(403, "Forbidden");
    }

    event.locals.access = access.claims;
  }

  const response = await resolve(event);
  const isHtmlError = response.status >= 400 && response.headers.get("Content-Type")?.includes("text/html");

  if (event.request.method === "GET" && isHtmlError) {
    error(response.status, response.statusText || ERROR_MESSAGES[response.status] || "Request Failed");
  }

  return response;
};
