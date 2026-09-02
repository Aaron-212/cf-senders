<script lang="ts">
import { enhance } from "$app/forms";
import { createToaster } from "@ark-ui/svelte/toast";
import type { SubmitFunction } from "@sveltejs/kit";
import { untrack } from "svelte";

import { EmailInput, InputField, MultiEmailInput, PlainTextEditor, Toast } from "@/lib/components";
import { ArrowUp, Bold, Italic, Strikethrough, Underline } from "@lucide/svelte";

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

const toaster = createToaster({ placement: "bottom-end", overlap: true, gap: 12 });
const MAX_RECIPIENTS = 50;

const validateToRecipients = () => {
  if (sendto.length === 0) {
    toaster.error({
      title: "Couldn’t send email",
      description: "Add at least one To recipient.",
    });
    return false;
  }

  if (sendto.length + sendcc.length + sendbcc.length > MAX_RECIPIENTS) {
    toaster.error({
      title: "Couldn’t send email",
      description: `Use no more than ${MAX_RECIPIENTS} recipients in total.`,
    });
    return false;
  }

  return true;
};

const handleSendClick = (event: globalThis.MouseEvent) => {
  if (!validateToRecipients()) event.preventDefault();
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

        toaster.success({
          title: "Email sent",
          description: "Email sent successfully.",
        });
      } else if (result.type === "failure") {
        toaster.error({
          title: "Couldn’t send email",
          description: result.data?.error ?? "The email could not be sent. Try again later.",
        });
      }
    } finally {
      sending = false;
    }
  };
};
</script>

<main class="flex flex-col gap-4">
  <form method="POST" use:enhance={submitEmail} class="flex flex-col gap-4 flex-wrap">
    <div class="flex flex-row gap-4">
      <h1 class="text-4xl font-semibold">CF Senders</h1>
      <button
        type="submit"
        onclick={handleSendClick}
        disabled={sending}
        class="ms-auto flex flex-row items-center justify-center rounded-full bg-blue-500 h-10 pl-4 pr-5 gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed text-white hover:bg-blue-500/80 transition-colors"
      >
        <ArrowUp />
        <span class="text-white font-medium">{sending ? "Sending…" : "Send"}</span>
      </button>
    </div>
    <MultiEmailInput
      bind:value={sendto}
      name="sendto"
      label="To"
      placeholder="Add a recipient"
      addOnPaste
      required
    />
    <div class="flex flex-row gap-4">
      <MultiEmailInput bind:value={sendcc} name="sendcc" label="CC" addOnPaste />
      <MultiEmailInput bind:value={sendbcc} name="sendbcc" label="BCC" addOnPaste />
    </div>
    <MultiEmailInput bind:value={sendreply} name="sendreply" label="Reply To" addOnPaste max={1} />
    <EmailInput bind:value={sendfrom} name="from" label="From" required />
    <InputField bind:value={sendsubject} type="text" name="subject" label="Subject" required />
    <div class="flex flex-row gap-2">
      <button
        type="button"
        aria-label="Bold"
        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center"
      >
        <Bold class="size-4" />
      </button>
      <button
        type="button"
        aria-label="Italic"
        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center"
      >
        <Italic class="size-4" />
      </button>
      <button
        type="button"
        aria-label="Underline"
        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center"
      >
        <Underline class="size-4" />
      </button>
      <button
        type="button"
        aria-label="Strikethrough"
        class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center"
      >
        <Strikethrough class="size-4" />
      </button>
    </div>
    <PlainTextEditor bind:value={sendbody} name="body" class="text-lg" />
  </form>
</main>

<Toast {toaster} />
