import { component$, Slot } from '@builder.io/qwik';
import clsx from 'clsx';
import { Spinner } from './Spinner';
import { type DefaultButtonProps, UnstyledButton } from './UnstyledButton';

type SystemIconProps = DefaultButtonProps & {
  label: string;
  loading?: boolean;
};

/**
 * System icon that is used for navigation, to confirm form entries or perform
 * individual actions.
 */
export const SystemIcon = component$<SystemIconProps>(
  ({ loading, ...props }) => (
    <UnstyledButton
      {...props}
      class={clsx(
        'focus-ring box-content flex h-5 w-5 cursor-pointer justify-center rounded-lg p-2 transition-colors hover:text-slate-900 md:h-[22px] md:w-[22px] lg:h-6 lg:w-6 dark:hover:text-slate-200',
        props.class
      )}
      aria-label={props.label}
    >
      {loading ? <Spinner label={`${props.label} is loading`} /> : <Slot />}
    </UnstyledButton>
  )
);
