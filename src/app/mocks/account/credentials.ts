// Пароль мок-учётки admin — общий для входа (auth-handlers) и смены пароля:
// сменили в «Настройки → Другое» — входить нужно с новым. Живёт до перезагрузки страницы.

const INITIAL_PASSWORD = 'Admin123';

let password = INITIAL_PASSWORD;

export const getMockPassword = () => password;

export const setMockPassword = (next: string) => {
  password = next;
};

export const resetMockPassword = () => {
  password = INITIAL_PASSWORD;
};
