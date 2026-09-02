import type { Handle } from "@sveltejs/kit";

import { validateCloudflareAccess } from "@/lib/server/cloudflare-access";

export const handle: Handle = async ({ event, resolve }) => {
  const access = await validateCloudflareAccess(event.request, event.platform?.env);

  if (!access.authenticated) {
    console.warn(
      JSON.stringify({
        message: "Cloudflare Access authentication failed",
        path: event.url.pathname,
        reason: access.reason,
      }),
    );

    return new Response("Forbidden", {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  event.locals.access = access.claims;
  return resolve(event);
};
