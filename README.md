# Aeza Outflow Risks — фронтенд

Админ-панель оценки риска оттока клиентов: дашборд, таблица и карточки клиентов, настройки
модели, управление снимками данных и сотрудниками.

## Стек

| Категория            | Библиотека                                |
| -------------------- | ----------------------------------------- |
| UI                   | React 19 + TypeScript, Radix UI           |
| Бандлер              | Vite 7 (SWC)                              |
| Серверное состояние  | TanStack Query v5                         |
| Клиентское состояние | Zustand v5 + Immer                        |
| Роутинг              | React Router v7                           |
| HTTP                 | Axios, клиент генерирует Orval из OpenAPI |
| Realtime             | SSE (`@microsoft/fetch-event-source`)     |
| Стили                | SCSS + CSS-переменные (токены из Figma)   |
| Формы и валидация    | react-hook-form, Zod                      |
| Тесты                | Vitest + React Testing Library + MSW      |
| Качество кода        | ESLint (flat config) + Prettier, Husky    |

## Начало работы

```bash
npm install
cp .env.example .env.development
npm run dev          # → http://localhost:3000
```

В dev по умолчанию включены MSW-моки, вход: `admin` / `Admin123`.

## Скрипты

| Скрипт                  | Описание                                              |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Dev-сервер на :3000                                   |
| `npm run dev:mocks`     | Dev-сервер с MSW-моками                               |
| `npm run dev:api`       | Dev-сервер с реальным бэкендом                        |
| `npm run build`         | Продакшн-сборка                                       |
| `npm run build:dev`     | Dev-сборка (с source maps)                            |
| `npm run preview`       | Просмотр продакшн-сборки                              |
| `npm run api:generate`  | Перегенерировать API-клиент из `openapi/openapi.yaml` |
| `npm run lint`          | ESLint (ноль предупреждений)                          |
| `npm run lint:fix`      | ESLint с автоисправлением                             |
| `npm run format`        | Проверка Prettier                                     |
| `npm run format:fix`    | Форматирование Prettier                               |
| `npm run test`          | Юнит- и интеграционные тесты                          |
| `npm run test:watch`    | Тесты в режиме слежения                               |
| `npm run test:ui`       | Vitest UI                                             |
| `npm run test:coverage` | Отчёт о покрытии                                      |

## Архитектура: Feature Sliced Design

```
app → pages → widgets → features → entities → shared
```

Слой импортирует только из слоёв ниже, слайс — только через его `index.ts`. Оба правила
проверяет ESLint (`import/no-restricted-paths`, `no-restricted-imports`).

```
src/
├── app/        # провайдеры, роутер, realtime-обновления, MSW-моки (app/mocks)
├── pages/      # auth, home, clients, client-card, settings, snapshot, not-found
├── widgets/    # крупные секции страниц: дашборд, таблица клиентов, карточка, настройки
├── features/   # действия пользователя: вход, импорт снимка, правка настроек модели…
├── entities/   # client, dashboard, model-settings, snapshot, user, session, calculation-date
└── shared/
    ├── api/      # axios-инстанс, ошибки, generated/ — код Orval (руками не править)
    ├── config/   # env (валидируется Zod), роуты, брейкпоинты
    ├── lib/      # хуки и утилиты без бизнес-логики
    ├── styles/   # SCSS-миксины брейкпоинтов (подключаются во все .scss автоматически)
    └── ui/       # компоненты дизайн-системы
```

## API

Единственный контракт фронта и бэка — [openapi/openapi.yaml](openapi/openapi.yaml). После
правки контракта запустите `npm run api:generate`: Orval обновит типы и функции запросов в
`src/shared/api/generated`. Сущности (`src/entities/*/api`) строят поверх них свои query-хуки.

## Моки

MSW-хэндлеры лежат в [src/app/mocks](src/app/mocks) и работают и в браузере, и в тестах.
Сценарий переключается параметром `?mock=<name>` в адресе страницы, например
`/clients?mock=no-data`. Список сценариев каждого раздела — в его `handlers.ts`.

## Добавление нового признака риска

Признаки score и их веса фронт не хардкодит: экран «Настройки → Модель» строит слайдеры по
`featureDefinitions` из `GET /api/v1/model/settings` (контракт — `openapi/openapi.yaml`, схемы
`FeatureDefinition`, `FactorWeights`). Поэтому новый признак добавляется только на бэкенде:

1. Реализовать вычисление признака: вклад 0–1 для услуги, итоговые баллы — вклад × вес.
2. Зарегистрировать признак в реестре: `key` (camelCase), `label`, `description`, вес по
   умолчанию 0–100.
3. Признак сам попадает в `featureDefinitions`, `defaults.factorWeights` и
   `values.factorWeights`. Сохранённые настройки без этого ключа при чтении дополняются весом по
   умолчанию.
4. В объяснениях клиента (`ClientFactor`, `ScoreFactor`) `id` фактора равен `key`.

После деплоя бэкенда достаточно обновить страницу: появится слайдер нового признака с подсказкой,
вес сохраняется обычным `PATCH /api/v1/model/settings`. Сценарий покрыт тестом
`src/pages/settings/__tests__/settings-page.test.tsx` («вес нового признака, который знает
только сервер»).

## Переменные окружения

| Переменная             | Обязательна | По умолчанию | Описание                                 |
| ---------------------- | ----------- | ------------ | ---------------------------------------- |
| `VITE_API_URL`         | ✅          | —            | Базовый URL API                          |
| `VITE_API_TIMEOUT`     | ❌          | `15000`      | Таймаут запроса (мс)                     |
| `VITE_ENABLE_DEVTOOLS` | ❌          | `true` в dev | TanStack Query и Zustand DevTools        |
| `VITE_ENABLE_MOCKS`    | ❌          | `true` в dev | MSW-моки в браузере                      |
| `DEV_PROXY_TARGET`     | ❌          | —            | Только dev-сервер: прокси `/api` на хост |

Переменные проверяются Zod при запуске: без обязательных приложение сразу падает. См.
[src/shared/config/env.ts](src/shared/config/env.ts).

## Анализ бандла

```bash
ANALYZE=true npm run build   # откроет dist/stats.html
```

## Деплой

Push в `main` собирает фронт в Docker и выкладывает `dist` на сервер, см.
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). `.env.production` берётся из
секрета `ENV_PRODUCTION`.
