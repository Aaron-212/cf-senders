<script lang="ts">
import { Input } from "@/lib/components/ui/input";
import { cn } from "@/lib/utils";
import type { HTMLInputAttributes } from "svelte/elements";

import { isValidEmail } from "@/lib/email";

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
  value?: string;
};

let {
  value = $bindable(""),
  ref = $bindable(null),
  invalid,
  disabled = false,
  readOnly = false,
  required = false,
  inputClass,
  id,
  ...inputProps
}: Props = $props();

const emailInvalid = $derived(value.trim().length > 0 && !isValidEmail(value));
const isInvalid = $derived(emailInvalid || Boolean(invalid));
</script>

<Input
  {...inputProps}
  bind:ref
  bind:value
  {id}
  type="email"
  {disabled}
  readonly={readOnly}
  {required}
  aria-invalid={isInvalid}
  class={cn("h-9", inputClass)}
/>
