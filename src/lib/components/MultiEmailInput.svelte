<script lang="ts">
import { TagsInput as ArkTagsInput } from "@ark-ui/svelte/tags-input";
import type { TagsInputRootProps } from "@ark-ui/svelte/tags-input";

import { X } from "@lucide/svelte";

import { isValidEmail } from "@/lib/email";

type Props =
  & Omit<
    TagsInputRootProps,
    "children" | "class" | "placeholder" | "value"
  >
  & {
    class?: string;
    errorText?: string;
    helperText?: string;
    label?: string;
    placeholder?: string | null;
    value?: string[];
  };

let {
  value = $bindable<string[]>([]),
  label = "Emails",
  placeholder,
  helperText,
  errorText,
  class: className,
  ...rootProps
}: Props = $props();

let inputValue = $state("");
let inputInvalid = $state(false);
let rejectedInput: string | null = null;

const validateInput = (candidate: string) => {
  const delimiter = rootProps.delimiter ?? ",";
  return candidate.split(delimiter).every(isValidEmail);
};

const isInvalid = $derived(inputInvalid || Boolean(rootProps.invalid));
const resolvedErrorText = $derived(errorText ?? (inputInvalid ? "Enter a valid email address." : undefined));

const handleInputValueChange: NonNullable<TagsInputRootProps["onInputValueChange"]> = (details) => {
  if (details.inputValue === "" && rejectedInput !== null) {
    const valueToRestore = rejectedInput;
    globalThis.queueMicrotask(() => inputValue = valueToRestore);
    rootProps.onInputValueChange?.({ inputValue: valueToRestore });
    return;
  }

  rejectedInput = null;
  inputInvalid = false;
  rootProps.onInputValueChange?.(details);
};

const handleValueInvalid: NonNullable<TagsInputRootProps["onValueInvalid"]> = (details) => {
  inputInvalid = details.reason === "invalidTag";
  rejectedInput = inputInvalid ? inputValue : null;
  rootProps.onValueInvalid?.(details);
};
</script>

<ArkTagsInput.Root
  {...rootProps}
  bind:value
  bind:inputValue
  invalid={isInvalid}
  validate={({ inputValue: candidate }) => validateInput(candidate)}
  onInputValueChange={handleInputValueChange}
  onValueInvalid={handleValueInvalid}
  placeholder={placeholder ?? undefined}
  class={`flex w-full min-w-0 max-w-full flex-row items-start gap-2 ${className ?? ""}`}
>
  <ArkTagsInput.Label class="text-md shrink-0 py-2 text-slate-700 dark:text-slate-300">
    {label}
  </ArkTagsInput.Label>

  <div class="flex min-w-0 max-w-full flex-1 flex-col">
    <ArkTagsInput.Control
      class="flex min-w-0 max-w-full flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1 border-b border-slate-300 p-1 transition-colors focus-within:border-slate-500 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-red-500 dark:border-slate-700 dark:focus-within:border-slate-500 dark:data-invalid:border-red-400"
    >
      {#each value as tag, index (`${tag}-${index}`)}
        <ArkTagsInput.Item {index} value={tag} class="min-w-0 max-w-full">
          <ArkTagsInput.ItemPreview
            class="flex max-w-full items-center gap-1 rounded-lg bg-blue-200 px-2 py-1 text-sm text-slate-800 data-highlighted:bg-blue-500 data-highlighted:text-slate-100 dark:bg-blue-950 dark:text-slate-100"
          >
            <ArkTagsInput.ItemText class="min-w-0 truncate">{tag}</ArkTagsInput.ItemText>
            <ArkTagsInput.ItemDeleteTrigger
              class="grid size-4 shrink-0 place-items-center rounded hover:bg-slate-500"
              aria-label={`Remove ${tag}`}
            >
              <X class="size-4" aria-hidden="true" />
            </ArkTagsInput.ItemDeleteTrigger>
          </ArkTagsInput.ItemPreview>
          <ArkTagsInput.ItemInput
            class="min-w-20 rounded-lg bg-transparent px-2 py-1 text-sm outline-none ring-2 ring-blue-500"
          />
        </ArkTagsInput.Item>
      {/each}

      <ArkTagsInput.Input
        placeholder={placeholder ?? ""}
        class="min-w-32 flex-1 bg-transparent px-2 py-1 text-md outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
      />

      {#if value.length > 0}
        <ArkTagsInput.ClearTrigger
          class="shrink-0 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-red-200 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-900 dark:hover:text-red-300"
        >
          Clear
        </ArkTagsInput.ClearTrigger>
      {/if}
    </ArkTagsInput.Control>

    {#if helperText}
      <p class="px-2 pt-1 text-sm text-slate-500 dark:text-slate-400">
        {helperText}
      </p>
    {/if}

    {#if isInvalid && resolvedErrorText}
      <p class="px-2 pt-1 text-sm text-red-500 dark:text-red-400" role="alert">
        {resolvedErrorText}
      </p>
    {/if}
  </div>

  <ArkTagsInput.HiddenInput />
</ArkTagsInput.Root>
