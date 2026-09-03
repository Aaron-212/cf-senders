declare global {
  namespace App {
    interface Error {
      id?: string;
    }

    interface Platform {
      env: Env;
      context: ExecutionContext;
      caches: CacheStorage;
    }
  }
}

export {};
