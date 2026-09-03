<script lang="ts">
import { enhance } from "$app/forms";
import type { SubmitFunction } from "@sveltejs/kit";
import { untrack } from "svelte";
import { toast } from "svelte-sonner";

import { EmailInput, InputField, MultiEmailInput, PlainTextEditor } from "@/lib/components";
import * as Collapsible from "$lib/components/ui/collapsible/index.js";
import { Button } from "@/lib/components/ui/button";
import * as Field from "@/lib/components/ui/field";
import { Toaster } from "@/lib/components/ui/sonner";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import { ArrowUp, ChevronsUpDown, Trash2 } from "@lucide/svelte";

import { isValidEmail } from "@/lib/email";

import type { PageProps } from "./$types";

let { form }: PageProps = $props();

const initialValues = untrack(() => form?.values);

let sendto = $state<string[]>(initialValues?.sendto ?? []);
let sendcc = $state<string[]>(initialValues?.sendcc ?? []);
let sendbcc = $state<string[]>(initialValues?.sendbcc ?? []);
let sendreply = $state<string[]>(initialValues?.sendreply ?? []);
let sendfrom = $state<string>(initialValues?.from ?? "");
let sendsubject = $state<string>(initialValues?.subject ?? "");
let sendbody = $state<string>(initialValues?.body ?? "");
let sending = $state(false);

type FieldErrors = Partial<Record<"sendto" | "sendcc" | "sendbcc" | "sendreply" | "from" | "subject" | "body", string>>;

let fieldErrors = $state<FieldErrors>({});
let sendtoInput = $state("");
let sendccInput = $state("");
let sendbccInput = $state("");
let sendreplyInput = $state("");

const MAX_RECIPIENTS = 50;
const MAX_SUBJECT_LENGTH = 998;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

const hasInvalidEmailInput = (value: string) =>
  value
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean)
    .some((address) => !isValidEmail(address));

const validateFields = () => {
  const errors: FieldErrors = {};

  if (sendto.length === 0) errors.sendto = "Add at least one To recipient.";
  if (hasInvalidEmailInput(sendtoInput)) errors.sendto = "Enter a valid email address.";
  if (hasInvalidEmailInput(sendccInput)) errors.sendcc = "Enter a valid email address.";
  if (hasInvalidEmailInput(sendbccInput)) errors.sendbcc = "Enter a valid email address.";
  if (hasInvalidEmailInput(sendreplyInput)) errors.sendreply = "Enter a valid email address.";

  if (sendto.length + sendcc.length + sendbcc.length > MAX_RECIPIENTS) {
    errors.sendto = `Use no more than ${MAX_RECIPIENTS} recipients in total.`;
  }

  if (!isValidEmail(sendfrom)) errors.from = "Enter a valid From address.";
  if (sendreply.length > 1) errors.sendreply = "Enter at most one Reply To address.";
  if (sendsubject.trim().length === 0) errors.subject = "Enter a subject.";
  if (sendsubject.length > MAX_SUBJECT_LENGTH) errors.subject = "The subject is too long.";
  if (new TextEncoder().encode(sendbody).byteLength > MAX_BODY_BYTES) {
    errors.body = "The message body is too large.";
  }

  fieldErrors = errors;
  return Object.keys(errors).length === 0;
};

const validateToRecipients = () => {
  if (!validateFields()) {
    toast.error("Couldn’t send email", {
      description: "Check the highlighted fields and try again.",
    });
    return false;
  }

  return true;
};

const handleSendClick = (event: globalThis.MouseEvent) => {
  if (!validateToRecipients()) event.preventDefault();
};

const clearInputs = () => {
  sendto = [];
  sendcc = [];
  sendbcc = [];
  sendreply = [];
  sendfrom = "";
  sendsubject = "";
  sendbody = "";
  sendtoInput = "";
  sendccInput = "";
  sendbccInput = "";
  sendreplyInput = "";
  fieldErrors = {};
};

const enterAdvancesFocus = (formElement: HTMLFormElement) => {
  const handleKeydown = (event: globalThis.KeyboardEvent) => {
    if (event.key !== "Enter" || event.isComposing || !(event.target instanceof HTMLInputElement)) return;

    event.preventDefault();

    const fields = Array.from(
      formElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input:not([type="hidden"]), textarea'),
    ).filter((field) => !field.disabled && !field.readOnly && field.getClientRects().length > 0);
    const currentIndex = fields.indexOf(event.target);

    fields[currentIndex + 1]?.focus();
  };

  formElement.addEventListener("keydown", handleKeydown);

  return {
    destroy: () => formElement.removeEventListener("keydown", handleKeydown),
  };
};

const submitEmail: SubmitFunction = ({ cancel }) => {
  if (!validateToRecipients()) {
    cancel();
    return;
  }

  sending = true;

  return async ({ result, update }) => {
    try {
      await update();

      if (result.type === "success") {
        sendto = [];
        sendcc = [];
        sendbcc = [];
        sendreply = [];
        sendfrom = "";
        sendsubject = "";
        sendbody = "";
        fieldErrors = {};

        toast.success("Email sent", {
          description: "Email sent successfully.",
        });
      } else if (result.type === "failure") {
        toast.error("Couldn’t send email", {
          description: result.data?.error ?? "The email could not be sent. Try again later.",
        });
      }
    } finally {
      sending = false;
    }
  };
};
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-6xl p-4 sm:p-6 lg:p-8">
  <form
    method="POST"
    use:enhance={submitEmail}
    use:enterAdvancesFocus
    class="flex min-h-0 w-full flex-1 flex-col gap-4"
  >
    <Collapsible.Root class="flex min-h-0 w-full flex-1 flex-col items-start gap-4">
      <header class="flex w-full flex-row items-start">
        <h1 class="text-2xl font-semibold">CF Senders</h1>
        <div class="flex items-center gap-2 self-end ml-auto sm:gap-4">
          <Collapsible.Trigger
            aria-label="Toggle special recipients"
            class={buttonVariants({
              variant: "outline",
              size: "lg",
              class:
                "size-9 px-0 has-data-[icon=inline-start]:pl-0 sm:w-auto sm:px-2.5 sm:has-data-[icon=inline-start]:pl-2",
            })}
          >
            <ChevronsUpDown data-icon="inline-start" />
            <span class="hidden sm:inline">Special recipients</span>
          </Collapsible.Trigger>
          <Button
            type="button"
            variant="destructive"
            onclick={clearInputs}
            disabled={sending}
            size="lg"
            aria-label="Clear"
            class="size-9 px-0 has-data-[icon=inline-start]:pl-0 sm:w-auto sm:px-2.5 sm:has-data-[icon=inline-start]:pl-2"
          >
            <Trash2 data-icon="inline-start" />
            <span class="hidden sm:inline">Clear</span>
          </Button>
          <Button
            type="submit"
            onclick={handleSendClick}
            disabled={sending}
            size="lg"
            aria-label={sending ? "Sending" : "Send"}
            class="size-9 px-0 has-data-[icon=inline-start]:pl-0 sm:w-auto sm:px-2.5 sm:has-data-[icon=inline-start]:pl-2"
          >
            <ArrowUp data-icon="inline-start" />
            <span class="hidden sm:inline">{sending ? "Sending…" : "Send"}</span>
          </Button>
        </div>
      </header>

      <Field.Set class="min-h-0 w-full flex-1">
        <Field.Group>
          <Field.Field data-invalid={Boolean(fieldErrors.sendto)}>
            <Field.Label for="sendto">To</Field.Label>
            <MultiEmailInput
              bind:value={sendto}
              bind:inputValue={sendtoInput}
              id="sendto"
              name="sendto"
              placeholder="Add a recipient"
              addOnPaste
              invalid={Boolean(fieldErrors.sendto)}
              onInputValueChange={() => (fieldErrors.sendto = undefined)}
              onValueChange={() => (fieldErrors.sendto = undefined)}
              onValueInvalid={() => (fieldErrors.sendto = "Enter a valid email address.")}
              required
            />
            {#if fieldErrors.sendto}
              <Field.Error>{fieldErrors.sendto}</Field.Error>
            {/if}
          </Field.Field>

          <Collapsible.Content class="space-y-6">
            <div class="grid gap-5 sm:grid-cols-2">
              <Field.Field data-invalid={Boolean(fieldErrors.sendcc)}>
                <Field.Label for="sendcc">CC</Field.Label>
                <MultiEmailInput
                  bind:value={sendcc}
                  bind:inputValue={sendccInput}
                  id="sendcc"
                  name="sendcc"
                  addOnPaste
                  invalid={Boolean(fieldErrors.sendcc)}
                  onInputValueChange={() => (fieldErrors.sendcc = undefined)}
                  onValueChange={() => (fieldErrors.sendcc = undefined)}
                  onValueInvalid={() => (fieldErrors.sendcc = "Enter a valid email address.")}
                />
                {#if fieldErrors.sendcc}
                  <Field.Error>{fieldErrors.sendcc}</Field.Error>
                {/if}
              </Field.Field>

              <Field.Field data-invalid={Boolean(fieldErrors.sendbcc)}>
                <Field.Label for="sendbcc">BCC</Field.Label>
                <MultiEmailInput
                  bind:value={sendbcc}
                  bind:inputValue={sendbccInput}
                  id="sendbcc"
                  name="sendbcc"
                  addOnPaste
                  invalid={Boolean(fieldErrors.sendbcc)}
                  onInputValueChange={() => (fieldErrors.sendbcc = undefined)}
                  onValueChange={() => (fieldErrors.sendbcc = undefined)}
                  onValueInvalid={() => (fieldErrors.sendbcc = "Enter a valid email address.")}
                />
                {#if fieldErrors.sendbcc}
                  <Field.Error>{fieldErrors.sendbcc}</Field.Error>
                {/if}
              </Field.Field>
            </div>

            <Field.Field data-invalid={Boolean(fieldErrors.sendreply)}>
              <Field.Label for="sendreply">Reply to</Field.Label>
              <MultiEmailInput
                bind:value={sendreply}
                bind:inputValue={sendreplyInput}
                id="sendreply"
                name="sendreply"
                addOnPaste
                invalid={Boolean(fieldErrors.sendreply)}
                max={1}
                onInputValueChange={() => (fieldErrors.sendreply = undefined)}
                onValueChange={() => (fieldErrors.sendreply = undefined)}
                onValueInvalid={({ reason }) =>
                  (fieldErrors.sendreply =
                    reason === "rangeOverflow"
                      ? "Enter at most one Reply To address."
                      : "Enter a valid email address.")}
              />
              {#if fieldErrors.sendreply}
                <Field.Error>{fieldErrors.sendreply}</Field.Error>
              {/if}
            </Field.Field>
          </Collapsible.Content>

          <Field.Field data-invalid={Boolean(fieldErrors.from)}>
            <Field.Label for="from">From</Field.Label>
            <EmailInput
              bind:value={sendfrom}
              id="from"
              name="from"
              invalid={Boolean(fieldErrors.from)}
              oninput={() => (fieldErrors.from = undefined)}
              required
            />
            {#if fieldErrors.from}
              <Field.Error>{fieldErrors.from}</Field.Error>
            {/if}
          </Field.Field>

          <Field.Field data-invalid={Boolean(fieldErrors.subject)}>
            <Field.Label for="subject">Subject</Field.Label>
            <InputField
              bind:value={sendsubject}
              id="subject"
              type="text"
              name="subject"
              invalid={Boolean(fieldErrors.subject)}
              maxlength={MAX_SUBJECT_LENGTH}
              oninput={() => (fieldErrors.subject = undefined)}
              required
            />
            {#if fieldErrors.subject}
              <Field.Error>{fieldErrors.subject}</Field.Error>
            {/if}
          </Field.Field>
        </Field.Group>

        <Field.Field class="min-h-0 flex-1" data-invalid={Boolean(fieldErrors.body)}>
          <Field.Label for="message-body">Message (Plaintext)</Field.Label>
          <PlainTextEditor
            bind:value={sendbody}
            id="message-body"
            name="body"
            placeholder="Write your message…"
            class="min-h-80 flex-1"
            aria-invalid={Boolean(fieldErrors.body)}
            oninput={() => (fieldErrors.body = undefined)}
          />
          {#if fieldErrors.body}
            <Field.Error>{fieldErrors.body}</Field.Error>
          {/if}
        </Field.Field>
      </Field.Set>
    </Collapsible.Root>
  </form>
</main>

<Toaster position="bottom-right" richColors closeButton />
