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
 * Stringify, prettify and tokenize log arguments.
 *
 * @param args The log arguments.
 *
 * @returns Array of tokens with type and text.
 */
function stringify(args) {
  return args
    .map((arg) => {
      // If argument is an error, stringify it
      if (arg instanceof Error) {
        return [{ type: 'text', text: arg.stack ?? `${arg.name}: ${arg.message}` }];
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

      // Transform JSON into tokens
      const tokens = [];
      while (jsonString) {
        for (const [tokenType, regex] of jsonTokens) {
          const match = regex.exec(jsonString);
          if (match) {
            const substring = match[0];
            jsonString = jsonString.substring(substring.length);

            // Map token types to display types
            if (tokenType === 'key') {
              tokens.push({ type: 'key', text: substring.slice(1, -1) });
            } else if (tokenType === 'instance') {
              tokens.push({ type: 'instance', text: substring.slice(2, -2) });
            } else if (tokenType === 'string') {
              tokens.push({ type: 'string', text: substring });
            } else if (tokenType === 'number') {
              tokens.push({ type: 'number', text: substring });
            } else if (tokenType === 'boolean' || tokenType === 'null') {
              tokens.push({ type: 'boolean', text: substring });
            } else if (
              tokenType === 'undefined' ||
              tokenType === 'infinity' ||
              tokenType === 'nan'
            ) {
              tokens.push({ type: 'special', text: substring.slice(2, -2) });
            } else {
              tokens.push({ type: 'text', text: substring });
            }
            break;
          }
        }
      }

      return tokens;
    })
    .flat(); // Flatten array of token arrays
}

/**
 * Get safe target origin for postMessage.
 * Uses ancestorOrigins (Chrome/Safari) or document.referrer (Firefox/others).
 *
 * @returns The safe target origin.
 */
function getSafeTargetOrigin() {
  if (window.location.ancestorOrigins && window.location.ancestorOrigins[0]) {
    return window.location.ancestorOrigins[0];
  }
  if (document.referrer) {
    try {
      return new URL(document.referrer).origin;
    } catch (e) {
      console.error('Failed to parse referrer origin:', e);
    }
  }
  // Fallback to same origin (safer than '*')
  return window.location.origin;
}

// Forward errors to parent window
window.onerror = (...args) => {
  parent.postMessage(
    { type: 'log', log: ['error', stringify([args[4]])] },
    getSafeTargetOrigin()
  );
};

// Forward logs to parent window
['log', 'info', 'debug', 'warn', 'error'].forEach((level) => {
  const original = console[level];
  console[level] = (...args) => {
    parent.postMessage(
      { type: 'log', log: [level, stringify(args)] },
      getSafeTargetOrigin()
    );
    original(...args);
  };
});

// Listen for code messages
window.addEventListener('message', (event) => {
  // Validate origin to prevent malicious code injection
  // Use ancestorOrigins (Chrome/Safari) or document.referrer (Firefox/others)
  let expectedOrigin;

  if (window.location.ancestorOrigins && window.location.ancestorOrigins[0]) {
    expectedOrigin = window.location.ancestorOrigins[0];
  } else if (document.referrer) {
    try {
      expectedOrigin = new URL(document.referrer).origin;
    } catch (e) {
      console.error('Failed to parse referrer origin:', e);
    }
  }

  // Reject if we can't determine expected origin OR if origin doesn't match
  if (!expectedOrigin || event.origin !== expectedOrigin) {
    console.error('Rejected message from unauthorized origin:', event.origin);
    return;
  }

  if (event.data.type === 'code') {
    const element = document.createElement('script');
    element.type = 'module';
    element.textContent = event.data.code;
    document.head.appendChild(element);
  }
});
