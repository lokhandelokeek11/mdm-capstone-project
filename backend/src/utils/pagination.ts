export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number } = {},
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? String(defaults.page ?? 1), 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(defaults.limit ?? 20), 10)),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total };
}
