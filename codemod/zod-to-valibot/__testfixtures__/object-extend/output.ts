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

// passthrough
const Schema4 = v.object({
  ...v.looseObject({foo: v.string()}).entries,
  bar: v.number()
});
const Schema5 = v.looseObject({foo: v.number()});
const Schema6 = v.object({
  .../*@valibot-migrate we can't detect if Schema5 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema5.entries,

  bar: v.string()
});
const Schema7 = v.looseObject({
  ...v.looseObject({foo: v.string()}).entries,
  bar: v.number()
});
const Schema8 = v.looseObject({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  bar: v.string()
});

// strict
const Schema9 = v.object({
  ...v.strictObject({foo: v.string()}).entries,
  bar: v.number()
});
const Schema10 = v.strictObject({foo: v.number()});
const Schema11 = v.object({
  .../*@valibot-migrate we can't detect if Schema10 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema10.entries,

  bar: v.string()
});
const Schema12 = v.strictObject({
  ...v.strictObject({foo: v.string()}).entries,
  bar: v.number()
});
const Schema13 = v.strictObject({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  bar: v.string()
});

// strip
const Schema14 = v.object({
  foo: v.string(),
  bar: v.number()
});
const Schema15 = v.object({foo: v.number()});
const Schema16 = v.object({
  .../*@valibot-migrate we can't detect if Schema15 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema15.entries,

  bar: v.string()
});
const Schema17 = v.object({
  foo: v.string(),
  bar: v.number()
});
const Schema18 = v.object({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  bar: v.string()
});

// catchall
const Schema19 = v.object({
  ...v.objectWithRest({foo: v.string()}, v.null()).entries,
  bar: v.number()
});
const Schema20 = v.objectWithRest({foo: v.number()}, v.null());
const Schema21 = v.object({
  .../*@valibot-migrate we can't detect if Schema20 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema20.entries,

  bar: v.string()
});
const Schema22 = v.objectWithRest({
  foo: v.string(),
  bar: v.number()
}, v.null());
const Schema23 = v.objectWithRest({
  .../*@valibot-migrate we can't detect if Schema2 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema2.entries,

  bar: v.string()
}, v.null());

// i don't know which crazy person would do this, but it is valid
// and we support it so we might as well test it
const Schema24 = v.object({
  .../*@valibot-migrate we can't detect if Schema23 has a `pipe` operator, if it does you might need to migrate this by hand otherwise it will loose it's pipeline*/
  Schema23.entries,

  ...[Schema22.entries]
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