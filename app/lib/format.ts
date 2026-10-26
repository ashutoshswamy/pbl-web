// Postgres numeric aggregates (avg of integers) arrive as strings, so coerce.
export const v = (n: number | string | null | undefined, d: number) => (n === null || n === undefined ? "--" : Number(n).toFixed(d));
