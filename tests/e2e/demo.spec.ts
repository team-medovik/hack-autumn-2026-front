import { expect, test } from '@playwright/test';

/**
 * E2E-тесты для страницы Demo.
 * Требует запущенного dev-сервера (управляется через playwright.config.ts webServer).
 */
test.describe('Demo page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
  });

  test('показывает заголовок страницы и все три карточки', async ({ page }) => {
    await expect(page.getByText('Template Demo')).toBeVisible();
    await expect(page.getByText('Клиентское состояние')).toBeVisible();
    await expect(page.getByText('Серверное состояние')).toBeVisible();
    await expect(page.getByText('react-hook-form + zod')).toBeVisible();
  });

  test('счётчик начинается с 0 и увеличивается', async ({ page }) => {
    const counter = page.getByTestId('counter-value');
    await expect(counter).toHaveText('0');

    await page.getByRole('button', { name: 'Увеличить' }).click();
    await expect(counter).toHaveText('1');

    await page.getByRole('button', { name: 'Увеличить' }).click();
    await expect(counter).toHaveText('2');
  });

  test('счётчик уменьшается', async ({ page }) => {
    await page.getByRole('button', { name: 'Увеличить' }).click();
    await page.getByRole('button', { name: 'Увеличить' }).click();
    await page.getByRole('button', { name: 'Уменьшить' }).click();

    await expect(page.getByTestId('counter-value')).toHaveText('1');
  });

  test('счётчик сбрасывается в 0', async ({ page }) => {
    await page.getByRole('button', { name: 'Увеличить' }).click();
    await page.getByRole('button', { name: 'Увеличить' }).click();
    await page.getByRole('button', { name: 'Сбросить' }).click();

    await expect(page.getByTestId('counter-value')).toHaveText('0');
  });

  test('посты загружаются из API', async ({ page }) => {
    // Ждём появления хотя бы одного поста
    await expect(page.locator('.demo-widget__item').first()).toBeVisible({ timeout: 10_000 });
  });

  test('форма показывает ошибки валидации при пустой отправке', async ({ page }) => {
    await page.getByRole('button', { name: /создать пост/i }).click();

    await expect(page.getByText('Минимум 5 символов')).toBeVisible();
    await expect(page.getByText('Минимум 10 символов')).toBeVisible();
  });

  test('форма принимает корректные данные и очищается после отправки', async ({ page }) => {
    // Ждём загрузки данных перед мутацией
    await page.locator('.demo-widget__item').first().waitFor({ timeout: 10_000 });

    const titleInput = page.getByLabel('Заголовок');
    const bodyInput = page.getByLabel('Текст поста');

    await titleInput.fill('Мой тестовый пост');
    await bodyInput.fill('Текст тестового поста длиннее десяти символов');
    await page.getByRole('button', { name: /создать пост/i }).click();

    // После успешной отправки форма должна очиститься
    await expect(titleInput).toHaveValue('', { timeout: 5_000 });
    await expect(bodyInput).toHaveValue('', { timeout: 5_000 });
  });

  test('главная страница содержит ссылку на демо', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /open demo/i }).click();
    await expect(page).toHaveURL('/demo');
    await expect(page.getByText('Template Demo')).toBeVisible();
  });
});
