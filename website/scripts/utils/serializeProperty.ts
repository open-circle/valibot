import type { PropertyProps } from '~/components';

type DefinitionData = PropertyProps['type'];

/**
 * Serializes a type definition into a TypeScript-like string. Mirrors the
 * text output of the `Definition` component in `src/components/Property.tsx`.
 *
 * @param data The type definition data.
 * @param parent The type of the parent definition.
 *
 * @returns A TypeScript-like string.
 */
function serializeDefinition(data: DefinitionData, parent?: string): string {
  // Serialize primitive and simple types
  if (typeof data === 'string') {
    return data;
  }

  // Serialize string literal type
  if (data.type === 'string') {
    return `'${data.value}'`;
  }

  // Serialize number and bigint literal type
  if (data.type === 'number' || data.type === 'bigint') {
    return `${data.value}`;
  }

  // Serialize boolean literal type
  if (data.type === 'boolean') {
    return data.value.toString();
  }

  // Serialize object type
  if (data.type === 'object') {
    if (!data.entries.length) {
      return '{}';
    }
    const entries = data.entries.map((entry) => {
      let key: string;
      if (typeof entry.key === 'string') {
        key = entry.key;
      } else if (entry.key.modifier) {
        key = `[${entry.key.name} ${entry.key.modifier}${
          entry.key.type
            ? ` ${serializeDefinition(entry.key.type, data.type)}`
            : ''
        }]`;
      } else if (entry.key.type) {
        key = `[${entry.key.name}: ${serializeDefinition(entry.key.type, data.type)}]`;
      } else {
        key = `[${entry.key.name}]`;
      }
      return `${key}${entry.optional ? '?' : ''}: ${serializeDefinition(entry.value, data.type)}`;
    });
    return `{ ${entries.join(', ')} }`;
  }

  // Serialize array type
  if (data.type === 'array') {
    const item = serializeDefinition(data.item, data.type);
    const wrapItem =
      typeof data.item === 'object' &&
      (data.item.type === 'union' ||
        data.item.type === 'intersect' ||
        (data.item.type === 'custom' && data.item.modifier));
    return `${data.modifier ? `${data.modifier} ` : ''}${data.spread ? '...' : ''}${wrapItem ? `(${item})` : item}[]`;
  }

  // Serialize tuple type
  if (data.type === 'tuple') {
    const items = data.items.map((item) =>
      serializeDefinition(item, data.type)
    );
    return `${data.modifier ? `${data.modifier} ` : ''}[${items.join(', ')}]`;
  }

  // Serialize function type
  if (data.type === 'function') {
    const params = data.params.map(
      (param) =>
        `${param.spread ? '...' : ''}${param.name}${param.optional ? '?' : ''}: ${serializeDefinition(param.type, data.type)}`
    );
    const text = `(${params.join(', ')}) => ${serializeDefinition(data.return, data.type)}`;
    const wrapText =
      parent === 'union' ||
      parent === 'intersect' ||
      (typeof data.return === 'object' &&
        (data.return.type === 'union' || data.return.type === 'intersect'));
    return wrapText ? `(${text})` : text;
  }

  // Serialize template literal type
  if (data.type === 'template') {
    const parts = data.parts.map((part) =>
      typeof part === 'object' && part.type === 'string'
        ? part.value
        : `\${${serializeDefinition(part, data.type)}}`
    );
    return `\`${parts.join('')}\``;
  }

  // Serialize union type
  if (data.type === 'union') {
    return data.options
      .map((option) => serializeDefinition(option, data.type))
      .join(' | ');
  }

  // Serialize intersect type
  if (data.type === 'intersect') {
    return data.options
      .map((option) => serializeDefinition(option, data.type))
      .join(' & ');
  }

  // Serialize conditional type
  if (data.type === 'conditional') {
    const conditions = data.conditions.map(
      (condition) =>
        `${serializeDefinition(condition.type, data.type)} extends ${serializeDefinition(condition.extends, data.type)} ? ${serializeDefinition(condition.true, data.type)} : `
    );
    return `${conditions.join('')}${serializeDefinition(data.false, data.type)}`;
  }

  // Serialize predicate type
  if (data.type === 'predicate') {
    return `${data.param} is ${serializeDefinition(data.is, 'conditional')}`;
  }

  // Serialize custom type
  return `${data.modifier ? `${data.modifier} ` : ''}${data.spread ? '...' : ''}${data.name}${
    data.generics
      ? `<${data.generics.map((generic) => serializeDefinition(generic, data.type)).join(', ')}>`
      : ''
  }${
    data.indexes
      ? data.indexes
          .map((index) => `[${serializeDefinition(index, data.type)}]`)
          .join('')
      : ''
  }`;
}

/**
 * Serializes the props of our `Property` component into a Markdown inline code
 * string with the same text content as its rendered HTML output.
 *
 * @param props The props of the `Property` component.
 *
 * @returns A Markdown inline code string.
 */
export function serializeProperty(props: PropertyProps): string {
  let text = props.modifier ? `${props.modifier} ` : '';
  text += serializeDefinition(props.type);
  if (props.default) {
    text += ` = ${serializeDefinition(props.default)}`;
  }
  // Use double backticks if text contains a backtick (e.g. template literals)
  return text.includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``;
}
