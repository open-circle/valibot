import { component$, type QRLEventHandlerMulti, Slot } from '@builder.io/qwik';
import { Link } from './Link';

export type LinkButtonProps = {
  class?: string;
  type: 'link';
  href: string;
  download?: boolean | string;
  target?: '_blank';
};

export type NormalButtonProps = {
  class?: string;
  type: 'button' | 'submit';
  'preventdefault:click'?: boolean;
  onClick$?:
    | ((event: PointerEvent, element: HTMLButtonElement) => any)
    | QRLEventHandlerMulti<PointerEvent, HTMLButtonElement>;
};

export type DefaultButtonProps = LinkButtonProps | NormalButtonProps;

type UnstyledButtonProps = DefaultButtonProps & {
  'aria-label'?: string;
};

/**
 * Basic button component that contains important functionality and is used to
 * build more complex components on top of it.
 */
export const UnstyledButton = component$((props: UnstyledButtonProps) => {
  if (props.type === 'link') {
    // External link
    if (props.target === '_blank') {
      return (
        <a {...props} rel="noreferrer">
          <Slot />
        </a>
      );
    }

    // Internal link
    return (
      <Link {...props}>
        <Slot />
      </Link>
    );
  }

  // Normal button
  return (
    <button {...props}>
      <Slot />
    </button>
  );
});
