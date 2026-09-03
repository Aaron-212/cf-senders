<script lang="ts">
import { Textarea } from "@/lib/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { HTMLTextareaAttributes } from "svelte/elements";

type Props = Omit<HTMLTextareaAttributes, "class" | "disabled" | "readonly" | "ref" | "required" | "value"> & {
  class?: string;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: HTMLTextAreaElement | null;
  required?: boolean;
  textareaClass?: string;
  value?: HTMLTextareaAttributes["value"];
};

let {
  value = $bindable(),
  ref = $bindable(null),
  disabled = false,
  readOnly = false,
  required = false,
  class: className,
  textareaClass,
  ...textareaProps
}: Props = $props();
</script>

<Textarea
  {...textareaProps}
  bind:ref
  bind:value
  {disabled}
  readonly={readOnly}
  {required}
  class={cn("resize-none", className, textareaClass)}
/>
