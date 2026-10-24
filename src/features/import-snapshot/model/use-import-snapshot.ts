import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import {
  addSnapshotToHistory,
  getSnapshotErrorMessage,
  inspectSnapshotFile,
  SnapshotFileError,
  snapshotsApi,
  WRONG_FORMAT_MESSAGE,
  type SnapshotFileSummary,
  type SnapshotRecord,
} from '@/entities/snapshot';
import { isClientError } from '@/shared/api';

/**
 * Шаги импорта по макетам «Импорт/экспорт снимка (…)»:
 * idle — ждём файл; invalid — «Файл не загружен»; confirm — «Заменить данные?»;
 * uploading — «Загружаем …» с прогрессом; done — «Снимок загружен».
 */
export type ImportStep =
  | { step: 'idle' }
  | { step: 'invalid'; message: string }
  | { step: 'confirm'; file: File; summary: SnapshotFileSummary }
  | { step: 'uploading'; fileName: string; progress: number }
  | { step: 'done'; snapshot: SnapshotRecord };

const IDLE: ImportStep = { step: 'idle' };

/** Отправка файла — до 90%, остаток — проверка и пересчёт на сервере. */
const UPLOAD_SHARE = 90;
const START_PROGRESS = 5;
/**
 * Пока сервер принимает файл и пересчитывает риски, шкала сама ползёт к 95% и замедляется —
 * пересчёт не сообщает прогресс, а стоящая шкала выглядит как зависание.
 */
const CREEP_LIMIT = 95;
const CREEP_STEP = 0.08;
const CREEP_INTERVAL_MS = 200;

const SERVER_UNAVAILABLE = 'Сервер не ответил. Попробуйте загрузить файл ещё раз';

const getUploadErrorMessage = (error: unknown) =>
  isClientError(error)
    ? (getSnapshotErrorMessage(error) ?? WRONG_FORMAT_MESSAGE)
    : SERVER_UNAVAILABLE;

interface ImportOptions {
  /** Есть текущий снимок — перед заменой спрашиваем. Первый снимок грузим сразу. */
  hasCurrent: boolean;
}

/** Импорт снимка: проверка файла, подтверждение замены, загрузка с прогрессом. */
export const useImportSnapshot = ({ hasCurrent }: ImportOptions) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ImportStep>(IDLE);
  // Пока читали один файл, могли выбрать другой — результат старого не нужен
  const latestPick = useRef<File | null>(null);

  const { mutate } = useMutation({
    mutationFn: (file: File) =>
      snapshotsApi.upload(file, (share) =>
        setState((current) =>
          current.step === 'uploading'
            ? { ...current, progress: Math.max(current.progress, share * UPLOAD_SHARE) }
            : current,
        ),
      ),
    onSuccess: (snapshot) => {
      setState({ step: 'done', snapshot });
      addSnapshotToHistory(queryClient, snapshot);
      // Данные заменены целиком: устарело всё — сводка, клиенты, распределение рисков
      void queryClient.invalidateQueries();
    },
    onError: (error) => setState({ step: 'invalid', message: getUploadErrorMessage(error) }),
  });

  const isUploading = state.step === 'uploading';
  useEffect(() => {
    if (!isUploading) {
      return undefined;
    }
    const timer = setInterval(
      () =>
        setState((current) =>
          current.step === 'uploading'
            ? {
                ...current,
                progress: current.progress + (CREEP_LIMIT - current.progress) * CREEP_STEP,
              }
            : current,
        ),
      CREEP_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [isUploading]);

  const upload = (file: File) => {
    setState({ step: 'uploading', fileName: file.name, progress: START_PROGRESS });
    mutate(file);
  };

  const pick = async (file: File) => {
    latestPick.current = file;
    try {
      const summary = await inspectSnapshotFile(file);
      if (latestPick.current !== file) {
        return;
      }
      if (hasCurrent) {
        setState({ step: 'confirm', file, summary });
      } else {
        upload(file);
      }
    } catch (error) {
      if (latestPick.current !== file) {
        return;
      }
      setState({
        step: 'invalid',
        message: error instanceof SnapshotFileError ? error.message : WRONG_FORMAT_MESSAGE,
      });
    }
  };

  return {
    state,
    /** Выбрали или бросили файл. Во время загрузки игнорируется. */
    pick: (file: File) => {
      if (state.step !== 'uploading') {
        void pick(file);
      }
    },
    confirm: () => {
      if (state.step === 'confirm') {
        upload(state.file);
      }
    },
    /** Отказались от замены. После «Заменить» диалог тоже закрывается — загрузку не трогаем. */
    cancel: () => setState((current) => (current.step === 'confirm' ? IDLE : current)),
    /** Закрыли «Снимок загружен». */
    finish: () => setState((current) => (current.step === 'done' ? IDLE : current)),
  };
};

export type ImportSnapshot = ReturnType<typeof useImportSnapshot>;
