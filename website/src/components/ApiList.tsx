import { component$ } from '@builder.io/qwik';
import { Link } from './Link';

type ApiListProps = {
  label?: string;
  items: string[];
};

/**
 * List to display APIs and navigate to their documentation.
 */
export const ApiList = component$<ApiListProps>(({ label, items }) => (
  <ul class="ml-8! flex list-none flex-row flex-wrap gap-2 lg:ml-10!">
    {label && label + ': '}
    {items.map((item, index) => (
      <li key={item} class="p-0!">
        <Link href={`/api/${item}/`}>
          <code>{item}</code>
        </Link>
        {index < items.length - 1 && ','}
      </li>
    ))}
  </ul>
));
