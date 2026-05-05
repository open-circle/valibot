import * as v from "valibot";

// plain
const Schema1 = v.object({
  foo: v.string(),
  bar: v.number()
});
const Schema2 = v.object({foo: v.number()});
const Schema3 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  bar: v.string()
});
const Schema4 = v.object({bar: v.number()});
const Schema5 = v.object({
  foo: v.string(),

  .../*@valibot-migrate we can't detect if Schema4 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema4.entries
});
const Schema6 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  .../*@valibot-migrate we can't detect if Schema4 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema4.entries
});

// passthrough
const Schema7 = v.object({
  foo: v.string(),
  ...v.looseObject({bar: v.number()}).entries
});
const Schema8 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  ...v.looseObject({bar: v.string()}).entries
});
const Schema9 = v.looseObject({bar: v.number()});
const Schema10 = v.object({
  foo: v.string(),

  .../*@valibot-migrate we can't detect if Schema9 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema9.entries
});
const Schema11 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  .../*@valibot-migrate we can't detect if Schema9 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema9.entries
});

// strict
const Schema12 = v.object({
  foo: v.string(),
  ...v.strictObject({bar: v.number()}).entries
});
const Schema13 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  ...v.strictObject({bar: v.string()}).entries
});
const Schema14 = v.strictObject({bar: v.number()});
const Schema15 = v.object({
  foo: v.string(),

  .../*@valibot-migrate we can't detect if Schema14 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema14.entries
});
const Schema16 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  .../*@valibot-migrate we can't detect if Schema14 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema14.entries
});

// strip
const Schema17 = v.object({
  foo: v.string(),
  bar: v.number()
});
const Schema18 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  bar: v.string()
});
const Schema19 = v.object({bar: v.number()});
const Schema20 = v.object({
  foo: v.string(),

  .../*@valibot-migrate we can't detect if Schema19 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema19.entries
});
const Schema21 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  .../*@valibot-migrate we can't detect if Schema19 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema19.entries
});

// catchall
const Schema22 = v.object({
  foo: v.string(),
  ...v.objectWithRest({bar: v.number()}, v.null()).entries
});
const Schema23 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  ...v.objectWithRest({bar: v.string()}, v.null()).entries
});
const Schema24 = v.objectWithRest({bar: v.number()}, v.null());
const Schema25 = v.object({
  foo: v.string(),

  .../*@valibot-migrate we can't detect if Schema24 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema24.entries
});
const Schema26 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  .../*@valibot-migrate we can't detect if Schema24 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema24.entries
});

// i don't know which crazy person would do this, but it is valid
// and we support it so we might as well test it
const Schema27 = v.object({
  .../*@valibot-migrate we can't detect if Schema26 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema26.entries,

  ...[Schema25].entries
});

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
// const Schema4 = v.object({bar: v.number()});
// const Schema5 = v.object({
//   foo: v.string(),
//   ...Schema4.entries
// });
// const Schema6 = v.object({
//   ...Schema2.entries,
//   ...Schema4.entries
// });

// // passthrough
// const Schema7 = v.object({
//   foo: v.string(),
//   ...v.looseObject({bar: v.number()}).entries
// });
// const Schema8 = v.object({
//   ...Schema2.entries,
//   ...v.looseObject({bar: v.string()}).entries
// });
// const Schema9 = v.looseObject({bar: v.number()});
// const Schema10 = v.object({
//   foo: v.string(),
//   ...Schema9.entries
// });
// const Schema11 = v.object({
//   ...Schema2.entries,
//   ...Schema9.entries
// });

// // strict
// const Schema12 = v.object({
//   foo: v.string(),
//   ...v.strictObject({bar: v.number()}).entries
// });
// const Schema13 = v.object({
//   ...Schema2.entries,
//   ...v.strictObject({bar: v.string()}).entries
// });
// const Schema14 = v.strictObject({bar: v.number()});
// const Schema15 = v.object({
//   foo: v.string(),
//   ...Schema14.entries
// });
// const Schema16 = v.object({
//   ...Schema2.entries,
//   ...Schema14.entries
// });

// // strip
// const Schema17 = v.object({
//   foo: v.string(),
//   bar: v.number()
// });
// const Schema18 = v.object({
//   ...Schema2.entries,
//   bar: v.string()
// });
// const Schema19 = v.object({bar: v.number()});
// const Schema20 = v.object({
//   foo: v.string(),
//   ...Schema19.entries
// });
// const Schema21 = v.object({
//   ...Schema2.entries,
//   ...Schema19.entries
// });

// // catchall
// const Schema22 = v.object({
//   foo: v.string(),
//   ...v.objectWithRest({bar: v.number()}, v.null()).entries
// });
// const Schema23 = v.object({
//   ...Schema2.entries,
//   ...v.objectWithRest({bar: v.string()}, v.null()).entries
// });
// const Schema24 = v.objectWithRest({bar: v.number()}, v.null());
// const Schema25 = v.object({
//   foo: v.string(),
//   ...Schema24.entries
// });
// const Schema26 = v.object({
//   ...Schema2.entries,
//   ...Schema24.entries
// });