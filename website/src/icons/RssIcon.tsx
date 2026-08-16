import { component$, type HTMLAttributes } from '@builder.io/qwik';

export const RssIcon = component$<HTMLAttributes<SVGSVGElement>>((props) => (
  <svg
    viewBox="0 0 48 48"
    role="img"
    aria-label="RSS icon"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={4}
    {...props}
  >
    <path d="M8 22a18 18 0 0 1 18 18M8 8a32 32 0 0 1 32 32" />
    <circle cx="10" cy="38" r="2" fill="currentColor" />
  </svg>
));
