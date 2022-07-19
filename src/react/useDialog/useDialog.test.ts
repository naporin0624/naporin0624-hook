import { act, renderHook } from "@testing-library/react";

import { success, fail } from "../../result";

import { useDialog } from ".";

import type { Result } from "../../result";

test.concurrent("set initialData", () => {
  const props = { open: true, hoge: "huga" };
  const { result } = renderHook(() => useDialog(props));

  if (result.current.props.open) {
    expect(result.current.props).toEqual(props);
  } else {
    expect.assertions(1);
  }
});

test.concurrent("open dialog", () => {
  const { result } = renderHook(() => useDialog());
  expect(result.current.props.open).toEqual(false);
  act(() => {
    result.current.showDialog();
  });

  expect(result.current.props.open).toEqual(true);
});

test.concurrent("toggle open state", () => {
  const { result } = renderHook(() => useDialog());
  expect(result.current.props.open).toEqual(false);

  let hideDialog: (() => void) | undefined = undefined;
  act(() => {
    hideDialog = result.current.showDialog().hideDialog;
  });

  expect(result.current.props.open).toEqual(true);

  act(() => {
    result.current.onOk();
    hideDialog?.();
  });

  expect(result.current.props.open).toEqual(false);
});

test.concurrent("change props", () => {
  const { result } = renderHook(() => useDialog<{ hoge: string }>());
  expect(result.current.props).toEqual({ open: false });

  act(() => {
    result.current.showDialog({ hoge: "hoge" });
  });

  expect(result.current.props).toEqual({ hoge: "hoge", open: true });

  act(() => {
    result.current.showDialog({ hoge: "huga" });
  });

  expect(result.current.props).toEqual({ hoge: "huga", open: true });
});

test.concurrent("receive data from dialog", async () => {
  const { result } = renderHook(() => useDialog<undefined, number>());
  let promise: Promise<Result<number, unknown>> | undefined = undefined;

  act(() => {
    promise = result.current.showDialog().result;
  });
  act(() => {
    result.current.onOk(1);
  });

  await expect(promise).resolves.toEqual(success(1));
});

test.concurrent("receive error from dialog", async () => {
  const { result } = renderHook(() => useDialog<undefined, number>());
  let promise: Promise<Result<number, unknown>> | undefined = undefined;

  act(() => {
    promise = result.current.showDialog().result;
  });
  act(() => {
    result.current.onCancel();
  });

  await expect(promise).resolves.toEqual(fail());
});
