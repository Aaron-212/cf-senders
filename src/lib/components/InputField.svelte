<script lang="ts">
import { Field as ArkField } from "@ark-ui/svelte/field";
import type { FieldInputProps } from "@ark-ui/svelte/field";

type Props = Omit<
  FieldInputProps,
  "asChild" | "children" | "class" | "disabled" | "readonly" | "ref" | "required" | "value"
> & {
  class?: string;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  inputClass?: string;
  invalid?: boolean;
  label: string;
  readOnly?: boolean;
  ref?: FieldInputProps["ref"];
  required?: boolean;
  value?: FieldInputProps["value"];
};

let {
  value = $bindable(),
  ref = $bindable(null),
  label,
  helperText,
  errorText,
  invalid,
  disabled = false,
  readOnly = false,
  required = false,
  class: className,
  inputClass,
  ...inputProps
}: Props = $props();

const isInvalid = $derived(invalid ?? Boolean(errorText));
</script>

<ArkField.Root
  {disabled}
  invalid={isInvalid}
  {readOnly}
  {required}
  class={`flex w-full min-w-0 max-w-full flex-row items-start gap-4 ${className ?? ""}`}
>
  <ArkField.Label class="text-md shrink-0 py-2 text-slate-700 dark:text-slate-300">
    {label}
  </ArkField.Label>

  <div class="flex min-w-0 max-w-full flex-1 flex-col">
    <div
      data-disabled={disabled ? "" : undefined}
      data-invalid={isInvalid ? "" : undefined}
      class="flex min-w-0 max-w-full flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1 border-b border-slate-300 p-1 transition-colors focus-within:border-slate-500 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-red-500 dark:border-slate-700 dark:focus-within:border-slate-500 dark:data-invalid:border-red-400"
    >
      <ArkField.Input
        {...inputProps}
        bind:ref
        bind:value
        class={`min-w-32 flex-1 bg-transparent px-2 py-1 text-md outline-none placeholder:text-slate-400 disabled:cursor-not-allowed ${
          inputClass ?? ""
        }`}
      />
    </div>

    {#if helperText}
      <ArkField.HelperText class="px-2 pt-1 text-sm text-slate-500 dark:text-slate-400">
        {helperText}
      </ArkField.HelperText>
    {/if}

    {#if isInvalid && errorText}
      <ArkField.ErrorText class="px-2 pt-1 text-sm text-red-500 dark:text-red-400">
        {errorText}
      </ArkField.ErrorText>
    {/if}
  </div>
</ArkField.Root>
