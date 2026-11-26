const statusByCode = {
  missing_credentials: 400,
  invalid_parameter: 400,
  not_found: 404,
  internal_server_error: 500,
} as const;

export type ApiErrorCode = keyof typeof statusByCode;

export function apiErrorResponse(error: ApiErrorCode, message: string) {
  return Response.json({ error, message }, { status: statusByCode[error] });
}
