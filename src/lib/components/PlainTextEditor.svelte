<script lang="ts">
import { Field as ArkField } from "@ark-ui/svelte/field";
import type { FieldTextareaProps } from "@ark-ui/svelte/field";

type Props =
  & Omit<
    FieldTextareaProps,
    "asChild" | "children" | "class" | "disabled" | "readonly" | "ref" | "required" | "value"
  >
  & {
    class?: string;
    disabled?: boolean;
    readOnly?: boolean;
    ref?: FieldTextareaProps["ref"];
    required?: boolean;
    textareaClass?: string;
    value?: FieldTextareaProps["value"];
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

<ArkField.Root
  {disabled}
  {readOnly}
  {required}
  class={`flex w-full min-w-0 max-w-full ${className ?? ""}`}
>
  <ArkField.Textarea
    {...textareaProps}
    bind:ref
    bind:value
    class={`min-h-32 min-w-32 flex-1 resize-y bg-transparent text-md outline-none placeholder:text-slate-400 disabled:cursor-not-allowed ${
      textareaClass ?? ""
    }`}
  />
</ArkField.Root>
