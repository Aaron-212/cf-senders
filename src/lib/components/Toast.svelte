<script lang="ts">
import { Toast as ArkToast, Toaster } from "@ark-ui/svelte/toast";
import type { CreateToasterReturn } from "@ark-ui/svelte/toast";

let { toaster }: { toaster: CreateToasterReturn; } = $props();
</script>

<Toaster {toaster}>
  {#snippet children(toast)}
    <ArkToast.Root
      class="w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 text-slate-950 shadow-lg h-(--height) opacity-(--opacity) scale-(--scale) [translate:var(--x)_var(--y)] z-(--z-index) transition-[translate,scale,opacity,height,box-shadow] duration-200 data-[type=error]:border-red-300 data-[type=success]:border-green-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:data-[type=error]:border-red-700 dark:data-[type=success]:border-green-700"
    >
      <div class="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
        <ArkToast.Title class="font-semibold">{toast().title}</ArkToast.Title>
        <ArkToast.CloseTrigger
          class="row-span-2 rounded-md px-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Dismiss notification"
        >
          &times;
        </ArkToast.CloseTrigger>
        <ArkToast.Description class="text-sm text-slate-600 dark:text-slate-300">
          {toast().description}
        </ArkToast.Description>
      </div>
    </ArkToast.Root>
  {/snippet}
</Toaster>
