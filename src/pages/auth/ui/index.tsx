import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useLoginAction } from '@/features/auth';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { FormWidget } from '@/widgets/form-widget';

type LoginFormValues = {
  login: string;
  password: string;
};

export const AuthPage = () => {
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: { login: '', password: '' },
  });

  const { mutate: login, isPending } = useLoginAction();

  // Макет: пустая форма — кнопка недоступна; после ошибки (логин заполнен, пароль очищен) — доступна
  const [loginValue, password] = watch(['login', 'password']);
  const isEmpty = !loginValue && !password;

  // Редирект после успешного входа делает GuestOnly. API ждёт логин в поле `email`.
  const onSubmit = (values: LoginFormValues) =>
    login(
      { data: { email: values.login, password: values.password } },
      {
        onError: (error) => {
          if (error.response?.status === 401) {
            // Макет «Вход (ошибка)»: логин остаётся, пароль очищается, ошибка под паролем
            resetField('password');
            setError('password', { message: 'Неверный логин или пароль' }, { shouldFocus: true });
            return;
          }
          toast.error('Не удалось войти', {
            description:
              error.response?.data?.message ?? 'Проверьте соединение и попробуйте ещё раз',
          });
        },
      },
    );

  return (
    <FormWidget
      title="вход в админ-панéль"
      description="введите логин и пароль"
      onSubmit={handleSubmit(onSubmit)}
      actions={
        <>
          <Button type="submit" variant="primary" fullWidth disabled={isEmpty} loading={isPending}>
            Продолжить
          </Button>
          <Button variant="secondary" fullWidth>
            Вход через SSO
          </Button>
        </>
      }
    >
      <Input
        label="логин"
        autoComplete="username"
        {...register('login')}
        error={errors.login?.message}
      />
      <Input
        label="пароль"
        type="password"
        autoComplete="current-password"
        {...register('password')}
        error={errors.password?.message}
      />
    </FormWidget>
  );
};
