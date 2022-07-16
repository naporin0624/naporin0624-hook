import { success, fail, isSuccess, isFail, unwrap, unwrapOr } from ".";

test.concurrent("success test", () => {
  expect(success(1)).toEqual({ value: 1, success: true });
  expect(success("")).toEqual({ value: "", success: true });
  expect(success(null)).toEqual({ value: null, success: true });

  const test1 = Symbol();
  expect(success(test1)).toEqual({ value: test1, success: true });

  const test2 = {};
  expect(success(test2)).toEqual({ value: test2, success: true });

  const test3 = new Date();
  expect(success(test3)).toEqual({ value: test3, success: true });
});

test.concurrent("isSuccess test", () => {
  const test1 = success(1);
  expect(isSuccess(test1)).toBe(true);

  const test2 = fail(1);
  expect(isSuccess(test2)).toBe(false);
});

test.concurrent("fail test", () => {
  expect(fail(1)).toEqual({ error: 1, success: false });
  expect(fail("")).toEqual({ error: "", success: false });
  expect(fail(null)).toEqual({ error: null, success: false });

  const test1 = Symbol();
  expect(fail(test1)).toEqual({ error: test1, success: false });

  const test2 = {};
  expect(fail(test2)).toEqual({ error: test2, success: false });

  const test3 = new Date();
  expect(fail(test3)).toEqual({ error: test3, success: false });
});

test.concurrent("isFail test", () => {
  const test1 = success(1);
  expect(isFail(test1)).toBe(false);

  const test2 = fail("1");
  expect(isFail(test2)).toBe(true);
});

test.concurrent("unwrap", () => {
  const test1 = success(1);
  expect(unwrap(test1)).toEqual(1);

  const test2 = fail("1");
  expect(() => unwrap(test2)).toThrow("1");
});

test.concurrent("unwrapOr", () => {
  const test1 = success(1);
  expect(unwrapOr(test1, 2)).toEqual(1);

  const test2 = fail("1");
  expect(unwrapOr(test2, 2)).toEqual(2);
});
