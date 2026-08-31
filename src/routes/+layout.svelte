<script lang="ts">
import "@/styles/global.css";

import type { Snippet } from "svelte";

let { children }: { children: Snippet; } = $props();
</script>

<svelte:head>
  <title>CF Senders</title>
</svelte:head>

<div class="flex flex-col select-none m-8">
  {@render children()}
</div>
