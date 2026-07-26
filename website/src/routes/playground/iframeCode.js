// Create list of JSON tokens
const jsonTokens = [
  ['whitespace', /^\s+/],
  ['brace', /^[{}]/],
  ['bracket', /^[[\]]/],
  ['colon', /^:/],
  ['comma', /^,/],
  ['key', /^"(?:\\.|[^"\\])*"(?=:)/],
  ['undefined', /^"\[undefined\]"/],
  ['infinity', /^"\[-?Infinity\]"/],
  ['nan', /^"\[NaN\]"/],
  ['instance', /^"\[[A-Z]\w*\]"/],
  ['string', /^"(?:\\.|[^"\\])*"/],
  ['number', /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/i],
  ['boolean', /^true|^false/],
  ['null', /^null/],
  ['unknown', /^.+/],
];

/**
 * Stringify, prettify and colorize log arguments.
 *
 * @param args The log arguments.
 *
 * @returns The stringified output.
 */
function stringify(args) {
  return args
    .map((arg) => {
      // If argument is an error, stringify it
      if (arg instanceof Error) {
        return arg.stack ?? `${arg.name}: ${arg.message}`;
      }

      // Otherwise, convert argument to JSON string
      let jsonString = JSON.stringify(
        arg,
        (_, value) => {
          // Get type of value
          const type = typeof value;

          // If it is a bigint, convert it to a number
          if (type === 'bigint') {
            return Number(value);
          }

          // If it is a non supported object, convert it to its constructor name
          if (value && (type === 'object' || type === 'function')) {
            const name = Object.getPrototypeOf(value)?.constructor?.name;
            if (name && name !== 'Object' && name !== 'Array') {
              return `[${name}]`;
            }
          }

          // If it is a non supported value, convert it to a string
          if (
            value === undefined ||
            value === Infinity ||
            value === -Infinity ||
            Number.isNaN(value)
          ) {
            return `[${value}]`;
          }

          // Otherwise, return value as is
          return value;
        },
        2
      );

      // Transform and colorize specific JSON tokens
      const output = [];
      while (jsonString) {
        for (const [token, regex] of jsonTokens) {
          const match = regex.exec(jsonString);
          if (match) {
            const substring = match[0];
            jsonString = jsonString.substring(substring.length);
            if (token === 'key') {
              output.push(
                `<span class="text-slate-700 dark:text-slate-300">${substring.slice(1, -1)}</span>`
              );
            } else if (token === 'instance') {
              output.push(
                `<span class="text-sky-600 dark:text-sky-400">${substring.slice(2, -2)}</span>`
              );
            } else if (token === 'string') {
              output.push(
                `<span class="text-yellow-600 dark:text-amber-200">${substring}</span>`
              );
            } else if (token === 'number') {
              output.push(
                `<span class="text-purple-600 dark:text-purple-400">${substring}</span>`
              );
            } else if (token === 'boolean' || token === 'null') {
              output.push(
                `<span class="text-teal-600 dark:text-teal-400">${substring}</span>`
              );
            } else if (
              token === 'undefined' ||
              token === 'infinity' ||
              token === 'nan'
            ) {
              output.push(
                `<span class="text-teal-600 dark:text-teal-400">${substring.slice(2, -2)}</span>`
              );
            } else {
              output.push(substring);
            }
            break;
          }
        }
      }

      // Return transformed and colorized output
      return output.join('');
    })
    .join(', ');
}

// Forward errors to parent window
window.onerror = (...args) => {
  parent.postMessage(
    { type: 'log', log: ['error', stringify([args[4]])] },
    '*'
  );
};

// Forward logs to parent window
['log', 'info', 'debug', 'warn', 'error'].forEach((level) => {
  const original = console[level];
  console[level] = (...args) => {
    parent.postMessage({ type: 'log', log: [level, stringify(args)] }, '*');
    original(...args);
  };
});

// Listen for code messages
window.addEventListener('message', (event) => {
  if (event.data.type === 'code') {
    const element = document.createElement('script');
    element.type = 'module';
    element.textContent = event.data.code;
    document.head.appendChild(element);
  }
});
