import { z } from "zod";

// plain
const Schema1 = z.object({foo: z.string()}).extend({bar: z.number()});
const Schema2 = z.object({foo: z.number()});
const Schema3 = Schema2.extend({bar: z.string()});

// passthrough
const Schema4 = z.object({foo: z.string()}).passthrough().extend({bar: z.number()});
const Schema5 = z.object({foo: z.number()}).passthrough();
const Schema6 = Schema5.extend({bar: z.string()});
const Schema7 = z.object({foo: z.string()}).extend({bar: z.number()}).passthrough();
const Schema8 = Schema2.extend({bar: z.string()}).passthrough();

// strict
const Schema9 = z.object({foo: z.string()}).strict().extend({bar: z.number()});
const Schema10 = z.object({foo: z.number()}).strict();
const Schema11 = Schema10.extend({bar: z.string()});
const Schema12 = z.object({foo: z.string()}).extend({bar: z.number()}).strict();
const Schema13 = Schema2.extend({bar: z.string()}).strict();

// strip
const Schema14 = z.object({foo: z.string()}).strict().strip().extend({bar: z.number()});
const Schema15 = z.object({foo: z.number()}).strict().strip();
const Schema16 = Schema15.extend({bar: z.string()});
const Schema17 = z.object({foo: z.string()}).extend({bar: z.number()}).strict().strip();
const Schema18 = Schema2.extend({bar: z.string()}).strict().strip();

// catchall
const Schema19 = z.object({foo: z.string()}).catchall(z.null()).extend({bar: z.number()});
const Schema20 = z.object({foo: z.number()}).catchall(z.null());
const Schema21 = Schema20.extend({bar: z.string()});
const Schema22 = z.object({foo: z.string()}).extend({bar: z.number()}).catchall(z.null());
const Schema23 = Schema2.extend({bar: z.string()}).catchall(z.null());

// i don't know which crazy person would do this, but it is valid
// and we support it so we might as well test it
const Schema24 = Schema23.extend(...[Schema22.shape]);

// ------------ Expected transform ------------
// // plain
// const Schema1 = v.object({
//   foo: v.string(),
//   bar: v.number()
// });
// const Schema2 = v.object({foo: v.number()});
// const Schema3 = v.object({
//   ...Schema2.entries,
//   bar: v.string()
// });

// // passthrough
// const Schema4 = v.object({
//   ...v.looseObject({foo: v.string()}).entries,
//   bar: v.number()
// });
// const Schema5 = v.looseObject({foo: v.number()});
// const Schema6 = v.object({
//   ...Schema5.entries,
//   bar: v.string()
// });
// const Schema7 = v.looseObject({
//   ...v.looseObject({foo: v.string()}).entries,
//   bar: v.number()
// });
// const Schema8 = v.looseObject({
//   ...Schema2.entries,
//   bar: v.string()
// });

// // strict
// const Schema9 = v.object({
//   ...v.strictObject({foo: v.string()}).entries,
//   bar: v.number()
// });
// const Schema10 = v.strictObject({foo: v.number()});
// const Schema11 = v.object({
//   ...Schema10.entries,
//   bar: v.string()
// });
// const Schema12 = v.strictObject({
//   ...v.strictObject({foo: v.string()}).entries,
//   bar: v.number()
// });
// const Schema13 = v.strictObject({
//   ...Schema2.entries,
//   bar: v.string()
// });

// // strip
// const Schema14 = v.object({
//   foo: v.string(),
//   bar: v.number()
// });
// const Schema15 = v.object({foo: v.number()});
// const Schema16 = v.object({
//   ...Schema15.entries,
//   bar: v.string()
// });
// const Schema17 = v.object({
//   foo: v.string(),
//   bar: v.number()
// });
// const Schema18 = v.object({
//   ...Schema2.entries,
//   bar: v.string()
// });

// // catchall
// const Schema19 = v.object({
//   ...v.objectWithRest({foo: v.string()}, v.null()).entries,
//   bar: v.number()
// });
// const Schema20 = v.objectWithRest({foo: v.number()}, v.null());
// const Schema21 = v.object({
//   ...Schema20.entries,
//   bar: v.string()
// });
// const Schema22 = v.objectWithRest({
//   foo: v.string(),
//   bar: v.number()
// }, v.null());
// const Schema23 = v.objectWithRest({
//   ...Schema2.entries,
//   bar: v.string()
// }, v.null());