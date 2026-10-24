/**
 * Отдать браузеру файл на сохранение: «Скачать JSON» после запроса с авторизацией,
 * когда обычная ссылка не подходит — ей не передать access-токен.
 */
export const saveFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Сразу после click браузер ещё может читать blob — отзываем в следующей задаче
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
