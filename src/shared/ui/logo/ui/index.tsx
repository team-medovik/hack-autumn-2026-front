import { clsx } from 'clsx';

import logoSrc from '../assets/logo.svg';

interface LogoProps {
  className?: string;
}

/** Логотип 40×40 из дизайн-системы. */
export const Logo = ({ className }: LogoProps) => (
  <img src={logoSrc} width={40} height={40} alt="Логотип" className={clsx('logo', className)} />
);
