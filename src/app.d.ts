import type { JWTPayload } from "jose";

declare global {
  namespace App {
    interface Locals {
      access: JWTPayload;
    }

    interface Platform {
      env: Env;
      context: ExecutionContext;
      caches: CacheStorage;
    }
  }
}

export {};
