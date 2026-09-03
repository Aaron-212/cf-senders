<script lang="ts">
import { page } from "$app/state";

const message = $derived(page.error?.message ?? "Something went wrong");
const description = $derived(
  page.status === 404
    ? "The requested page could not be found."
    : page.status === 403
      ? "You do not have permission to view this page."
      : "The requested page could not be displayed.",
);
</script>

<svelte:head>
  <title>{page.status} · {message}</title>
</svelte:head>

<main class="flex min-h-dvh items-center justify-center p-6">
  <section class="flex max-w-xl flex-col items-center gap-5 text-center" aria-labelledby="error-title">
    <p class="text-7xl font-semibold tracking-tight text-foreground tabular-nums">{page.status}</p>
    <div class="space-y-2">
      <h1 id="error-title" class="text-2xl font-semibold tracking-tight">{message}</h1>
      <p class="text-sm text-muted-foreground">{description}</p>
    </div>

    {#if page.error?.id}
      <p class="font-mono text-xs text-muted-foreground">Error ID: {page.error.id}</p>
    {/if}

    <a
      href="/"
      class="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      Return home
    </a>
  </section>
</main>
