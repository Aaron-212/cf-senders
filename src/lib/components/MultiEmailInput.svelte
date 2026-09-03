<script lang="ts">
import { Badge } from "@/lib/components/ui/badge";
import * as InputGroup from "@/lib/components/ui/input-group";
import { X } from "@lucide/svelte";
import type { ClipboardEventHandler, FocusEventHandler, KeyboardEventHandler } from "svelte/elements";

import { isValidEmail } from "@/lib/email";

type ValueChangeDetails = { value: string[] };
type InputValueChangeDetails = { inputValue: string };
type ValueInvalidDetails = {
  reason: "invalidTag" | "rangeOverflow";
  values: string[];
};

type Props = {
  addOnPaste?: boolean;
  allowDuplicates?: boolean;
  allowOverflow?: boolean;
  autoFocus?: boolean;
  blurBehavior?: "add" | "clear";
  delimiter?: string | RegExp;
  disabled?: boolean;
  form?: string;
  id?: string;
  inputValue?: string;
  invalid?: boolean;
  max?: number;
  maxLength?: number;
  name?: string;
  onInputValueChange?: (details: InputValueChangeDetails) => void;
  onValueChange?: (details: ValueChangeDetails) => void;
  onValueInvalid?: (details: ValueInvalidDetails) => void;
  placeholder?: string | null;
  readOnly?: boolean;
  required?: boolean;
  sanitizeValue?: (value: string) => string;
  validate?: (details: { inputValue: string; value: string[] }) => boolean;
  value?: string[];
};

let {
  value = $bindable<string[]>([]),
  inputValue = $bindable(""),
  placeholder,
  addOnPaste = false,
  allowDuplicates = false,
  allowOverflow = false,
  autoFocus = false,
  blurBehavior,
  delimiter = ",",
  disabled = false,
  form,
  id,
  invalid = false,
  max = Number.POSITIVE_INFINITY,
  maxLength,
  name,
  onInputValueChange,
  onValueChange,
  onValueInvalid,
  readOnly = false,
  required = false,
  sanitizeValue = (candidate) => candidate.trim(),
  validate,
}: Props = $props();

let invalidReason = $state<ValueInvalidDetails["reason"] | null>(null);

const isInvalid = $derived(invalidReason !== null || invalid || value.length > max);
const serializedValue = $derived(value.join(typeof delimiter === "string" ? delimiter : ","));

const setInputValue = (nextValue: string) => {
  inputValue = nextValue;
  invalidReason = null;
  onInputValueChange?.({ inputValue: nextValue });
};

const setValue = (nextValue: string[]) => {
  value = nextValue;
  onValueChange?.({ value: nextValue });
};

const reject = (reason: ValueInvalidDetails["reason"], values: string[]) => {
  invalidReason = reason;
  onValueInvalid?.({ reason, values });
};

const splitCandidates = (candidate: string) => candidate.split(delimiter).map(sanitizeValue).filter(Boolean);

const commit = (candidate: string) => {
  const candidates = splitCandidates(candidate);
  if (candidates.length === 0) return true;

  if (
    candidates.some(
      (email) =>
        !isValidEmail(email) ||
        (validate !== undefined && !validate({ inputValue: email, value })) ||
        (!allowDuplicates && value.includes(email)),
    ) ||
    (!allowDuplicates && new Set(candidates).size !== candidates.length)
  ) {
    reject("invalidTag", candidates);
    return false;
  }

  const nextValue = [...value, ...candidates];
  if (!allowOverflow && nextValue.length > max) {
    reject("rangeOverflow", candidates);
    return false;
  }

  setValue(nextValue);
  setInputValue("");
  return true;
};

const remove = (index: number) => {
  if (disabled || readOnly) return;
  setValue(value.filter((_, valueIndex) => valueIndex !== index));
};

const clear = () => {
  if (disabled || readOnly) return;
  setValue([]);
  invalidReason = null;
};

const handleInput = (event: Event & { currentTarget: HTMLInputElement }) => {
  const nextValue = event.currentTarget.value;
  setInputValue(nextValue);

  if (typeof delimiter === "string" && delimiter.length === 1 && nextValue.endsWith(delimiter)) {
    commit(nextValue.slice(0, -delimiter.length));
  }
};

const handleKeydown: KeyboardEventHandler<HTMLInputElement> = (event) => {
  if (event.isComposing || disabled || readOnly) return;

  if (event.key === "Enter" || event.key === " " || (typeof delimiter === "string" && event.key === delimiter)) {
    event.preventDefault();
    commit(inputValue);
    return;
  }

  if (event.key === "Backspace" && inputValue === "" && value.length > 0) {
    remove(value.length - 1);
  }
};

const handlePaste: ClipboardEventHandler<HTMLInputElement> = (event) => {
  if (!addOnPaste || disabled || readOnly) return;

  event.preventDefault();
  const pastedValue = event.clipboardData?.getData("text") ?? "";
  setInputValue(pastedValue);
  commit(pastedValue);
};

const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
  if (blurBehavior === "add") commit(inputValue);
  if (blurBehavior === "clear") setInputValue("");
};
</script>

<InputGroup.Root data-disabled={disabled} class="h-auto min-h-9 flex-wrap gap-1">
  {#if value.length > 0}
    <InputGroup.Addon class="flex-wrap gap-1 justify-start">
      {#each value as tag, index (`${tag}-${index}`)}
        <Badge variant="outline" class="max-w-full bg-white dark:bg-black">
          <span class="min-w-0 truncate">{tag}</span>
          <button
            aria-label={`Remove ${tag}`}
            disabled={disabled || readOnly}
            onclick={() => remove(index)}
            class="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors size-3 rounded-full"
          >
            <X aria-hidden="true" class="size-3" />
          </button>
        </Badge>
      {/each}
    </InputGroup.Addon>
  {/if}

  <InputGroup.Input
    {id}
    type="email"
    value={inputValue}
    placeholder={placeholder ?? ""}
    {disabled}
    readonly={readOnly}
    required={required && value.length === 0}
    maxlength={maxLength}
    autofocus={autoFocus}
    aria-invalid={isInvalid}
    class="min-w-32"
    oninput={handleInput}
    onkeydown={handleKeydown}
    onpaste={handlePaste}
    onblur={handleBlur}
  />

  {#if value.length > 0}
    <InputGroup.Addon align="inline-end" class="py-0 pr-2">
      <InputGroup.Button disabled={disabled || readOnly} onclick={clear}>Clear</InputGroup.Button>
    </InputGroup.Addon>
  {/if}
</InputGroup.Root>

{#if name}
  <input type="hidden" {name} {form} value={serializedValue} />
{/if}
