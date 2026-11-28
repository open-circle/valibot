import * as v from "valibot";

const Foo = v.object({
  foo: v.string(),
  bar: v.number(),
});

const Schema1 = v.pick(Foo, ["foo"]);
const Schema2 = v.omit(Foo, ["foo"]);
const Schema3 = v.required(Foo);
const Schema4 = v.keyof(Foo);
const Schema5 = v.partial(v.object({key: v.string()}));
const output1 = v.parse(Foo, {});
const output2 = v.safeParse(Foo, {});