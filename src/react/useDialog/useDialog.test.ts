import { act, renderHook } from "@testing-library/react";
import { ok, err } from "neverthrow";

import { useDialog } from ".";

import type { HandleDialog } from ".";

const mockHandleDialog = <T = undefined>() =>
  Promise.resolve<HandleDialog<T>>(null as unknown as HandleDialog<T>);

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

test.concurrent("toggle open state", async () => {
  const { result } = renderHook(() => useDialog());
  expect(result.current.props.open).toEqual(false);
  let promise: Promise<HandleDialog<undefined>> = mockHandleDialog();

  act(() => {
    promise = result.current.showDialog();
  });
  expect(result.current.props.open).toEqual(true);

  act(() => {
    result.current.onOk();
  });

  await act(async () => {
    const handleDialog = await promise;
    handleDialog.hideDialog();
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
  let promise: Promise<HandleDialog<number>> = mockHandleDialog<number>();
  act(() => {
    promise = result.current.showDialog();
  });

  act(() => {
    result.current.onOk(1);
  });

  await expect(promise.then((p) => p.result)).resolves.toEqual(ok(1));
});

test.concurrent("receive error from dialog", async () => {
  const { result } = renderHook(() => useDialog<undefined, number>());
  let promise: Promise<HandleDialog<number>> = mockHandleDialog<number>();
  act(() => {
    promise = result.current.showDialog();
  });

  act(() => {
    result.current.onCancel();
  });

  await expect(promise.then((p) => p.result)).resolves.toEqual(err(undefined));
});
