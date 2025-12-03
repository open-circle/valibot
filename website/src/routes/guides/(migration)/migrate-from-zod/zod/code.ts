import * as z from 'zod';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

Schema.parse({
  email: 'jane@example.com',
  password: '12345678',
});
