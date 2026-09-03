import type { HandleServerError } from "@sveltejs/kit";

const getErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
};

export const handleError: HandleServerError = ({ error, event, message, status }) => {
  if (status < 500) {
    return { message };
  }

  const errorId = crypto.randomUUID();

  console.error(
    JSON.stringify({
      message: "Unhandled application error",
      errorId,
      method: event.request.method,
      path: event.url.pathname,
      status,
      error: getErrorDetails(error),
    }),
  );

  return {
    message,
    id: errorId,
  };
};
