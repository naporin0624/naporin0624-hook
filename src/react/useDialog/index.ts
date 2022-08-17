import { ok, err } from "neverthrow";
import { useCallback, useMemo, useState } from "react";

import type { Result } from "neverthrow";

type DialogState<T> = T extends Record<string, unknown>
  ? ({ open: true } & T) | ({ open: false } & Partial<T>)
  : { open: true } | { open: false };

const openProps = <T>(state: T): DialogState<T> => {
  return { open: true, ...(state ? state : {}) } as DialogState<T>;
};

type Awaiter<E, T> = {
  resolve: (value: T) => void;
  reject: (error: E) => void;
};

type State<Input, Output> = {
  props: DialogState<Input>;
} & Partial<Awaiter<Error, Result<Output, undefined>>>;

type RequireOrOptional<T> = T extends undefined ? [] : [value: T];

export interface HandleDialog<T> {
  result: Result<T, unknown>;
  hideDialog: () => void;
}

type Dialog<Input, Output> = {
  props: DialogState<Input>;
  showDialog: (
    ...input: RequireOrOptional<Input>
  ) => Promise<HandleDialog<Output>>;
  onOk: (...input: RequireOrOptional<Output>) => void;
  onCancel: () => void;
};

export const useDialog = <
  ModalInput extends Record<string, unknown> | undefined = undefined,
  ModalOutput = undefined
>(
  initialState?: DialogState<ModalInput>
): Dialog<ModalInput, ModalOutput> => {
  const [dialogState, setDialogState] = useState<
    State<ModalInput, ModalOutput>
  >(
    () =>
      ({
        props: initialState ? initialState : { open: false },
      } as State<ModalInput, ModalOutput>)
  );

  const hideDialog = useCallback(() => {
    setDialogState(({ props }) => ({ props: { ...props, open: false } }));
  }, []);

  const showDialog: Dialog<ModalInput, ModalOutput>["showDialog"] = useCallback(
    async (...args) => {
      const [props] = args;

      const result = await new Promise<Result<ModalOutput, undefined>>(
        (resolve, reject) => {
          setDialogState((previous) => ({
            ...previous,
            props: openProps<ModalInput>(props as ModalInput),
            resolve,
            reject,
          }));
        }
      );

      return { result, hideDialog };
    },
    [hideDialog]
  );

  const onOk: Dialog<ModalInput, ModalOutput>["onOk"] = useCallback(
    (...args) => {
      const [value] = args;

      dialogState.resolve?.(ok(value as ModalOutput));
    },
    [dialogState]
  );

  const onCancel: Dialog<ModalInput, ModalOutput>["onCancel"] =
    useCallback(() => {
      dialogState.resolve?.(err(undefined));
    }, [dialogState]);

  return useMemo(
    () => ({
      showDialog,
      onOk,
      onCancel,
      props: dialogState.props,
    }),
    [showDialog, onOk, onCancel, dialogState]
  );
};
