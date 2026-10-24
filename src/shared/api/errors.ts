import axios from 'axios';

const statusOf = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/** Сервер ответил 404 — сущности нет. */
export const isNotFoundError = (error: unknown) => statusOf(error) === 404;

/** Ошибка запроса (4xx): повтор ответа не изменит. */
export const isClientError = (error: unknown) => {
  const status = statusOf(error);
  return status !== undefined && status >= 400 && status < 500;
};
