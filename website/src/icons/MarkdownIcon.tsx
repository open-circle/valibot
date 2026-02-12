import { component$, type HTMLAttributes } from '@builder.io/qwik';

export const MarkdownIcon = component$<HTMLAttributes<SVGSVGElement>>(
  (props) => (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Markdown icon"
      fill="currentColor"
      {...props}
    >
      <path d="M28.59 24.64a2 2 0 0 1 .65-.47 2 2 0 0 1 1.53 0q.36.15.65.47L38 31.77l6.58-7.13a2 2 0 0 1 .65-.47 2 2 0 0 1 1.53 0q.38.16.65.47.29.3.44.7a2.3 2.3 0 0 1 0 1.66q-.15.4-.44.7l-8 8.67a2 2 0 0 1-.64.47 2 2 0 0 1-1.54 0 2 2 0 0 1-.65-.48l-8-8.66a2 2 0 0 1-.43-.7 2.3 2.3 0 0 1 0-1.66q.15-.4.44-.7" />
      <path d="M37.9 12a2.1 2.1 0 0 1 2.1 2.08v16.67c0 .55-.22 1.08-.62 1.47a2.1 2.1 0 0 1-2.97 0 2 2 0 0 1-.62-1.47V14.08c0-.55.22-1.08.62-1.47s.93-.61 1.49-.61M4.46 37V20.38h.24l6.01 13.5h3.26l5.98-13.5h.24V37h4.51V12h-5.05l-7.2 16.23h-.16L5.09 12H0v25z" />
    </svg>
  )
);
