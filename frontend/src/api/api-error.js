export function getApiError(error) {
  const payload = error?.response?.data;
  const nestedError = payload?.error;

  return {
    code: payload?.code || nestedError?.code || "REQUEST_FAILED",

    message:
      payload?.message ||
      nestedError?.message ||
      error?.message ||
      "The request could not be completed.",

    requestId:
      payload?.request_id ||
      nestedError?.request_id ||
      error?.response?.headers?.["x-request-id"] ||
      null,
  };
}