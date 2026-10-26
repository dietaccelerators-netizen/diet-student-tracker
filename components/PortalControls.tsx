'use client';

import type { ButtonHTMLAttributes } from 'react';
import { PortalIcon } from './PortalIcon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  loading?: boolean;
  loadingLabel?: string;
};

/** Native semantics, explicit submit opt-in, and one pending state across the portal. */
export function PortalButton({ variant = 'secondary', loading = false, loadingLabel = 'Working…', disabled, children, type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} data-ui={variant} disabled={disabled || loading} aria-busy={loading || undefined}>
    {loading ? <><span className="portal-spinner" aria-hidden="true"/>{loadingLabel}</> : children}
  </button>;
}

export function IconButton({ label, icon, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & { label: string; icon: string }) {
  return <button {...props} type={props.type ?? 'button'} data-ui="icon" aria-label={label} title={label}><PortalIcon name={icon}/></button>;
}

export function FilterPill({ selected, children, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> & { selected: boolean }) {
  return <button {...props} type={props.type ?? 'button'} data-ui="pill" aria-pressed={selected}>{children}</button>;
}
