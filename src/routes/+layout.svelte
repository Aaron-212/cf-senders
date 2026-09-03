<script lang="ts">
import "@/styles/global.css";

import { ModeWatcher } from "mode-watcher";
import type { Snippet } from "svelte";

let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <title>CF Senders</title>
</svelte:head>

<ModeWatcher />

{@render children()}
