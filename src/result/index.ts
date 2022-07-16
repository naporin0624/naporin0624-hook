type Success<T> = { success: true; value: T };
type Fail<E> = { success: false; error?: E };

export type Result<T, E> = Success<T> | Fail<E>;

export const success = <T>(value: T): Result<T, never> => ({
  success: true,
  value,
});
export const fail = <E>(error?: E): Result<never, E> => ({
  success: false,
  error,
});

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.success;
export const isFail = <T, E>(result: Result<T, E>): result is Fail<E> =>
  !result.success;

export const unwrap = <T>(result: Result<T, unknown>): T => {
  if (result.success) return result.value;
  throw result.error;
};

export const unwrapOr = <T, U>(
  result: Result<T, unknown>,
  fallback: U
): T | U => {
  return result.success ? result.value : fallback;
};
