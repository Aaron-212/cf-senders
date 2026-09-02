<script lang="ts">
import { Collapsible as ArkCollapsible } from "@ark-ui/svelte/collapsible";
import type { Snippet } from "svelte";

let {
  trigger,
  indicator,
  children,
  defaultOpen = false,
  rootClass,
  triggerClass,
  contentClass,
}: {
  trigger: Snippet;
  indicator?: Snippet;
  children: Snippet;
  defaultOpen?: boolean;
  rootClass?: string;
  triggerClass?: string;
  contentClass?: string;
} = $props();
</script>

<ArkCollapsible.Root {defaultOpen} class={rootClass}>
  <ArkCollapsible.Trigger type="button" class={triggerClass}>
    {@render trigger()}
    {#if indicator}
      <ArkCollapsible.Indicator class="collapsible-indicator">
        {@render indicator()}
      </ArkCollapsible.Indicator>
    {/if}
  </ArkCollapsible.Trigger>
  <ArkCollapsible.Content class={`collapsible-content ${contentClass ?? ""}`}>
    {@render children()}
  </ArkCollapsible.Content>
</ArkCollapsible.Root>

<style>
:global(.collapsible-indicator) {
  transition: transform 200ms ease;
}

:global(.collapsible-indicator[data-state="open"]) {
  transform: rotate(180deg);
}

:global(.collapsible-content[data-state="open"]) {
  animation: expand 200ms ease-out;
}

:global(.collapsible-content[data-state="closed"]) {
  animation: collapse 200ms ease-in;
}

@keyframes expand {
  from {
    height: 0;
  }
  to {
    height: var(--height);
  }
}

@keyframes collapse {
  from {
    height: var(--height);
  }
  to {
    height: 0;
  }
}
</style>
