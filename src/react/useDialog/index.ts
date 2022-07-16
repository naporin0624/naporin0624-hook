import { useCallback, useMemo, useState } from "react";

import { success, fail } from "../../result";

import type { Result } from "../../result";

type DialogState<T> =
  | {
      open: true;
      props: T;
    }
  | {
      open: false;
      props: { [K in keyof T]?: T[K] };
    };

type Awaiter<E, T> = {
  resolve: (value: T) => void;
  reject: (error: E) => void;
};

type State<Input, Output> = DialogState<Input> &
  Partial<Awaiter<Error, Result<Output, undefined>>>;

type RequireOrOptional<T> = T extends undefined ? [] : [value: T];

type Dialog<Input, Output> = DialogState<Input> & {
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
  >(initialState ?? { open: false, props: {} });

  const hideDialog = useCallback(() => {
    setDialogState(({ props }) => ({ open: false, props }));
  }, []);

  const showDialog: Dialog<ModalInput, ModalOutput>["showDialog"] = useCallback(
    (...args) => {
      const [props] = args;

      const result = new Promise<Result<ModalOutput, undefined>>(
        (resolve, reject) => {
          setDialogState((previous) => ({
            ...previous,
            open: true,
            props: props as ModalInput,
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
      ...(dialogState.open
        ? { open: true, props: dialogState.props }
        : { open: false, props: dialogState.props }),
    }),
    [showDialog, onOk, onCancel, dialogState]
  );
};
