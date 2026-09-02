<script lang="ts">
import { enhance } from "$app/forms";
import { createToaster } from "@ark-ui/svelte/toast";
import type { SubmitFunction } from "@sveltejs/kit";
import { untrack } from "svelte";

import { Collapsible, EmailInput, InputField, MultiEmailInput, PlainTextEditor, Toast } from "@/lib/components";
import { ArrowUp, Bold, ChevronDown, Italic, Strikethrough, Underline } from "@lucide/svelte";

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

const toaster = createToaster({
  placement: "bottom-end",
  overlap: true,
  gap: 12,
});
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
          description: result.data?.error
            ?? "The email could not be sent. Try again later.",
        });
      }
    } finally {
      sending = false;
    }
  };
};
</script>

<main class="flex h-[calc(100dvh-4rem)] min-h-0 flex-col gap-4">
  <form
    method="POST"
    use:enhance={submitEmail}
    class="flex min-h-0 flex-1 flex-col gap-4"
  >
    <div class="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:gap-4">
      <h1 class="text-4xl font-semibold">CF Senders</h1>
      <Collapsible
        defaultOpen
        rootClass="contents"
        triggerClass="col-start-2 row-start-1 flex h-10 flex-row items-center justify-center gap-2 rounded-full bg-white px-4 font-medium transition-colors hover:bg-slate-100 dark:bg-black dark:hover:bg-slate-900"
        contentClass="col-span-3 row-start-2 mt-2 flex flex-col gap-2 overflow-hidden rounded-2xl bg-white px-4 py-3 lg:gap-4 dark:bg-black"
      >
        {#snippet trigger()}
          <span>Metadata</span>
        {/snippet}
        {#snippet indicator()}
          <ChevronDown class="size-4" />
        {/snippet}
        <MultiEmailInput
          bind:value={sendto}
          name="sendto"
          label="To"
          placeholder="Add a recipient"
          addOnPaste
          required
        />
        <div class="flex flex-col gap-2 lg:flex-row lg:gap-4">
          <MultiEmailInput bind:value={sendcc} name="sendcc" label="CC" addOnPaste />
          <MultiEmailInput bind:value={sendbcc} name="sendbcc" label="BCC" addOnPaste />
        </div>
        <MultiEmailInput
          bind:value={sendreply}
          name="sendreply"
          label="Reply To"
          addOnPaste
          max={1}
        />
        <EmailInput bind:value={sendfrom} name="from" label="From" required />
        <InputField bind:value={sendsubject} type="text" name="subject" label="Subject" required />
      </Collapsible>
      <button
        type="submit"
        onclick={handleSendClick}
        disabled={sending}
        class="col-start-3 row-start-1 flex h-10 flex-row items-center justify-center gap-2 rounded-full bg-blue-500 pr-5 pl-4 text-white transition-colors hover:bg-blue-500/80 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        <ArrowUp />
        <span class="font-medium text-white">{sending ? "Sending…" : "Send"}</span>
      </button>
    </div>
    <!--
    <div class="flex flex-row gap-2">
      <button
        type="button"
        aria-label="Bold"
        class="bg-white dark:bg-black px-2 py-1 rounded-lg text-sm size-8 place-items-center"
      >
        <Bold class="size-4" />
      </button>
      <button
        type="button"
        aria-label="Italic"
        class="bg-white dark:bg-black px-2 py-1 rounded-lg text-sm size-8 place-items-center"
      >
        <Italic class="size-4" />
      </button>
      <button
        type="button"
        aria-label="Underline"
        class="bg-white dark:bg-black px-2 py-1 rounded-lg text-sm size-8 place-items-center"
      >
        <Underline class="size-4" />
      </button>
      <button
        type="button"
        aria-label="Strikethrough"
        class="bg-white dark:bg-black px-2 py-1 rounded-lg text-sm size-8 place-items-center"
      >
        <Strikethrough class="size-4" />
      </button>
    </div>
    -->
    <PlainTextEditor
      bind:value={sendbody}
      name="body"
      class="min-h-0 flex-1 overflow-hidden rounded-2xl bg-white p-2 text-lg dark:bg-black"
      textareaClass="px-2 py-1"
      style="min-height: 0;
overflow-y: auto;
resize: none;"
    />
  </form>
</main>

<Toast {toaster} />
