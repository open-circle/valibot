import { component$ } from '@builder.io/qwik';
import { TextLink } from './TextLink';

/**
 * Footer with copyright notice and links to legal text.
 */
export const Footer = component$(() => (
  <footer class="flex justify-between p-4 text-sm md:text-base lg:px-8 lg:py-6 lg:text-[17px]">
    <div>&copy; {new Date().getFullYear()} Fabian Hiller</div>
    <nav class="flex gap-5 lg:gap-12">
      {[
        { label: 'Contact', href: '/contact/' },
        { label: 'Privacy', href: '/privacy/' },
      ].map(({ label, href }) => (
        <TextLink key={href} href={href}>
          {label}
        </TextLink>
      ))}
    </nav>
  </footer>
));
