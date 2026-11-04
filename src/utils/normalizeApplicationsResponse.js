// Pure helper (no imports) so it can be unit-tested with `node --test`.
// Turns the raw university applications payload into a safe shape,
// or throws if the payload cannot be trusted.

export class InvalidResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidResponseError';
  }
}

export function normalizeApplicationsResponse(data, fallbackPageSize = 20) {
  if (!data || typeof data !== 'object') {
    throw new InvalidResponseError('The server sent an unreadable response.');
  }
  // `applications: null` (or anything that is not an array) is an error, NOT an empty list.
  if (!Array.isArray(data.applications)) {
    throw new InvalidResponseError('The server sent an invalid list of applications.');
  }
  const total = Number(data.total);
  if (data.total === null || data.total === undefined || !Number.isFinite(total) || total < 0) {
    throw new InvalidResponseError('The server sent an invalid total.');
  }
  const pageSize = Number(data.pageSize) > 0 ? Number(data.pageSize) : fallbackPageSize;
  // totalPages may be missing: derive it from total and pageSize.
  const hasTotalPages = data.totalPages !== null && data.totalPages !== undefined && Number.isFinite(Number(data.totalPages));
  return {
    applications: data.applications,
    total,
    page: Number(data.page) || 1,
    pageSize,
    totalPages: hasTotalPages ? Number(data.totalPages) : Math.ceil(total / pageSize),
  };
}
