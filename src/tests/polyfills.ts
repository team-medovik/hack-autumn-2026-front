// Отдельным файлом раньше setup.ts: импорты там поднимаются выше кода, а MSW проверяет
// EventSource уже при создании sse()-хэндлеров. В jsdom его нет; поток читаем через fetch,
// так что настоящий EventSource не нужен — достаточно, чтобы он был.
globalThis.EventSource ??= class {} as unknown as typeof EventSource;
