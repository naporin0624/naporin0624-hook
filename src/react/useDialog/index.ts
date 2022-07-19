import { useCallback, useMemo, useState } from "react";

import { success, fail } from "../../result";

import type { Result } from "../../result";

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

type Dialog<Input, Output> = {
  props: DialogState<Input>;
  showDialog: (...input: RequireOrOptional<Input>) => {
    result: Promise<Result<Output, unknown>>;
    hideDialog: () => void;
  };
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
    (...args) => {
      const [props] = args;

      const result = new Promise<Result<ModalOutput, undefined>>(
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

      dialogState.resolve?.(success(value as ModalOutput));
    },
    [dialogState]
  );

  const onCancel: Dialog<ModalInput, ModalOutput>["onCancel"] =
    useCallback(() => {
      dialogState.resolve?.(fail());
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
