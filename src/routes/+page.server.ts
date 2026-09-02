import { fail } from "@sveltejs/kit";

import { isValidEmail } from "@/lib/email";

import type { Actions } from "./$types";

const MAX_RECIPIENTS = 50;
const MAX_SUBJECT_LENGTH = 998;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

type FormValues = {
  sendto: string[];
  sendcc: string[];
  sendbcc: string[];
  sendreply: string[];
  from: string;
  subject: string;
  body: string;
};

const getText = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

const getAddresses = (formData: FormData, name: string) =>
  getText(formData, name)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

const getFormValues = (formData: FormData): FormValues => ({
  sendto: getAddresses(formData, "sendto"),
  sendcc: getAddresses(formData, "sendcc"),
  sendbcc: getAddresses(formData, "sendbcc"),
  sendreply: getAddresses(formData, "sendreply"),
  from: getText(formData, "from").trim(),
  subject: getText(formData, "subject"),
  body: getText(formData, "body"),
});

const emptyFormValues = (): FormValues => ({
  sendto: [],
  sendcc: [],
  sendbcc: [],
  sendreply: [],
  from: "",
  subject: "",
  body: "",
});

const getEmailServiceError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;

  return { code, message };
};

const getClientError = (code: string | undefined) => {
  switch (code) {
    case "E_SENDER_NOT_VERIFIED":
    case "E_SENDER_DOMAIN_NOT_AVAILABLE":
      return { status: 400, message: "The sender domain is not enabled for Cloudflare Email Service." };
    case "E_RECIPIENT_NOT_ALLOWED":
      return { status: 400, message: "One or more recipients are not allowed by the email binding." };
    case "E_RECIPIENT_SUPPRESSED":
      return { status: 422, message: "One or more recipients cannot currently receive email." };
    case "E_RATE_LIMIT_EXCEEDED":
    case "E_DAILY_LIMIT_EXCEEDED":
      return { status: 429, message: "The email sending limit has been reached. Try again later." };
    case "E_VALIDATION_ERROR":
    case "E_FIELD_MISSING":
    case "E_TOO_MANY_RECIPIENTS":
    case "E_CONTENT_TOO_LARGE":
      return { status: 400, message: "Cloudflare rejected the email fields. Check them and try again." };
    case "E_DELIVERY_FAILED":
      return { status: 502, message: "Cloudflare could not deliver the email. Try again later." };
    default:
      return { status: 500, message: "The email could not be sent. Try again later." };
  }
};

export const actions = {
  default: async ({ request, platform }) => {
    const values = getFormValues(await request.formData());
    const recipients = [...values.sendto, ...values.sendcc, ...values.sendbcc];

    if (values.sendto.length === 0) {
      return fail(400, { success: false, error: "Add at least one To recipient.", values });
    }

    if (recipients.some((address) => !isValidEmail(address))) {
      return fail(400, { success: false, error: "Enter valid recipient email addresses.", values });
    }

    if (recipients.length > MAX_RECIPIENTS) {
      return fail(400, { success: false, error: `Use no more than ${MAX_RECIPIENTS} recipients.`, values });
    }

    if (!isValidEmail(values.from)) {
      return fail(400, { success: false, error: "Enter a valid From address.", values });
    }

    if (values.sendreply.length > 1 || values.sendreply.some((address) => !isValidEmail(address))) {
      return fail(400, { success: false, error: "Enter at most one valid Reply To address.", values });
    }

    if (values.subject.trim().length === 0) {
      return fail(400, { success: false, error: "Enter a subject.", values });
    }

    if (values.subject.length > MAX_SUBJECT_LENGTH) {
      return fail(400, { success: false, error: "The subject is too long.", values });
    }

    if (new TextEncoder().encode(values.body).byteLength > MAX_BODY_BYTES) {
      return fail(400, { success: false, error: "The message body is too large.", values });
    }

    if (!platform?.env.EMAIL) {
      return fail(503, {
        success: false,
        error: "The Cloudflare email binding is unavailable in this environment.",
        values,
      });
    }

    try {
      const result = await platform.env.EMAIL.send({
        to: values.sendto,
        from: values.from,
        subject: values.subject.trim(),
        text: values.body,
        ...(values.sendcc.length > 0 ? { cc: values.sendcc } : {}),
        ...(values.sendbcc.length > 0 ? { bcc: values.sendbcc } : {}),
        ...(values.sendreply[0] ? { replyTo: values.sendreply[0] } : {}),
      });

      return { success: true, messageId: result.messageId, values: emptyFormValues() };
    } catch (error) {
      const serviceError = getEmailServiceError(error);
      const clientError = getClientError(serviceError.code);

      console.error(
        JSON.stringify({
          message: "Email sending failed",
          code: serviceError.code,
          error: serviceError.message,
        }),
      );

      return fail(clientError.status, { success: false, error: clientError.message, values });
    }
  },
} satisfies Actions;
