<script lang="ts">
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";
import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

type Props = Omit<
  HTMLInputAttributes,
  "class" | "disabled" | "files" | "id" | "readonly" | "ref" | "required" | "type" | "value"
> & {
  disabled?: boolean;
  inputClass?: string;
  invalid?: boolean;
  id?: string;
  readOnly?: boolean;
  ref?: HTMLInputElement | null;
  required?: boolean;
  type?: Exclude<HTMLInputTypeAttribute, "file">;
  value?: HTMLInputAttributes["value"];
};

let {
  value = $bindable(),
  ref = $bindable(null),
  invalid,
  disabled = false,
  readOnly = false,
  required = false,
  inputClass,
  id,
  ...inputProps
}: Props = $props();
</script>

<Input
  {...inputProps}
  bind:ref
  bind:value
  {id}
  {disabled}
  readonly={readOnly}
  {required}
  aria-invalid={invalid}
  class={cn("h-9", inputClass)}
/>
