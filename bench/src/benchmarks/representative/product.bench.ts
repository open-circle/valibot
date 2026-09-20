import { bench, describe } from 'vitest';
import * as v from '../../../../library/src/index.ts';

/**
 * Creates a representative product schema.
 * @returns A representative product schema.
 */
function createProductSchema(): v.GenericSchema {
  const imageSchema = v.object({
    id: v.number(),
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    type: v.picklist(['jpg', 'png']),
    url: v.pipe(v.string(), v.url()),
  });
  const ratingSchema = v.object({
    id: v.number(),
    stars: v.pipe(v.number(), v.minValue(1), v.maxValue(5)),
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    text: v.pipe(v.string(), v.minLength(1), v.maxLength(1_000)),
    images: v.array(imageSchema),
  });
  return v.object({
    id: v.number(),
    created: v.date(),
    title: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
    email: v.pipe(v.string(), v.minLength(10), v.email()),
    brand: v.pipe(v.string(), v.minLength(1), v.maxLength(30)),
    description: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
    price: v.pipe(v.number(), v.minValue(1), v.maxValue(10_000)),
    discount: v.nullable(v.pipe(v.number(), v.minValue(1), v.maxValue(100))),
    quantity: v.pipe(v.number(), v.minValue(0), v.maxValue(10)),
    tags: v.array(v.pipe(v.string(), v.minLength(1), v.maxLength(30))),
    images: v.array(imageSchema),
    ratings: v.array(ratingSchema),
  });
}

const validInput = {
  id: 252,
  created: new Date('2024-01-01T00:00:00.000Z'),
  title: 'Apple',
  email: 'hello@example.com',
  brand: 'Sunny Backyard',
  description: 'Red apple from Lake Constance',
  price: 89,
  discount: null,
  quantity: 5,
  tags: ['fruit', 'red', 'round', 'sweet', 'juicy', 'healthy'],
  images: [
    {
      id: 248,
      title: 'Close up of an apple on a tree',
      type: 'jpg',
      url: 'https://www.example.com/images/248',
    },
  ],
  ratings: [
    {
      id: 315,
      stars: 4.5,
      title: 'Tastes super delicious',
      text: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
      images: [
        {
          id: 835,
          title: 'The result of our apple pie',
          type: 'png',
          url: 'https://www.example.com/images/835',
        },
      ],
    },
  ],
};

const invalidInput = {
  ...validInput,
  title: '',
  email: 'a',
  brand: '',
  description: '',
  price: 0,
  discount: 101,
  quantity: 11,
  tags: ['fruit', ''],
  images: [
    {
      id: 248,
      title: '',
      type: 'mp4',
      url: 'invalid',
    },
  ],
  ratings: [
    {
      id: 315,
      stars: 6,
      title: '',
      text: '',
      images: [
        {
          id: 835,
          title: '',
          type: 'mp4',
          url: 'invalid',
        },
      ],
    },
  ],
};

const schema = createProductSchema();

describe('assert', () => {
  bench('valid input', () => {
    v.assert(schema, validInput);
  });
  bench('invalid input', () => {
    try {
      v.assert(schema, invalidInput);
    } catch (error) {
      if (!v.isValiError(error)) {
        throw error;
      }
    }
  });
});

describe('is', () => {
  bench('valid input', () => {
    v.is(schema, validInput);
  });
  bench('invalid input', () => {
    v.is(schema, invalidInput);
  });
});

describe('parse', () => {
  bench('valid input', () => {
    v.parse(schema, validInput);
  });
  bench('invalid input', () => {
    try {
      v.parse(schema, invalidInput);
    } catch (error) {
      if (!v.isValiError(error)) {
        throw error;
      }
    }
  });
});

describe('safeParse', () => {
  bench('valid input', () => {
    v.safeParse(schema, validInput);
  });
  bench('invalid input (all errors)', () => {
    v.safeParse(schema, invalidInput);
  });
  bench('invalid input (abort early)', () => {
    v.safeParse(schema, invalidInput, { abortEarly: true });
  });
  bench('invalid input (abort pipe early)', () => {
    v.safeParse(schema, invalidInput, { abortPipeEarly: true });
  });
});

describe('schema', () => {
  bench('create representative schema', () => {
    createProductSchema();
  });
});
