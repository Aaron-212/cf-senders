<script lang="ts">
import { EmailInput, InputField, MultiEmailInput, PlainTextEditor } from "@/lib/components";
import { ArrowUp, Bold, Italic, Strikethrough, Underline } from "@lucide/svelte";

let sendto = $state<string[]>([]);
let sendcc = $state<string[]>([]);
let sendbcc = $state<string[]>([]);
let sendreply = $state<string[]>([]);
let sendfrom = $state<string>("");
let sendsubject = $state<string>("");
let sendbody = $state<string>("");
</script>

<main class="flex flex-col gap-4">
  <form class="flex flex-col gap-4 flex-wrap">
    <div class="flex flex-row gap-4">
      <h1 class="text-4xl font-semibold">CF Senders</h1>
      <button class="ms-auto flex flex-row items-center justify-center rounded-full bg-blue-500 h-10 pl-4 pr-5 gap-2 data-disabled:bg-slate-500 text-white">
        <ArrowUp />
        <p class="text-white font-medium">Send</p>
      </button>
    </div>
    <MultiEmailInput bind:value={sendto} name="sendto" label="To" placeholder="Add a recipient" addOnPaste />
    <div class="flex flex-row gap-4">
      <MultiEmailInput bind:value={sendcc} name="sendcc" label="CC" addOnPaste />
      <MultiEmailInput bind:value={sendbcc} name="sendbcc" label="BCC" addOnPaste />
    </div>
    <MultiEmailInput bind:value={sendreply} name="sendreply" label="Reply To" addOnPaste />
    <EmailInput bind:value={sendfrom} name="from" label="From" />
    <InputField bind:value={sendsubject} type="text" name="subject" label="Subject" />
    <div class="flex flex-row gap-2">
      <button class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center">
        <Bold class="size-4" />
      </button>
      <button class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center">
        <Italic class="size-4" />
      </button>
      <button class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center">
        <Underline class="size-4" />
      </button>
      <button class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm size-8 place-items-center">
        <Strikethrough class="size-4" />
      </button>
    </div>
    <PlainTextEditor bind:value={sendbody} name="body" class="text-lg" />
  </form>
</main>
