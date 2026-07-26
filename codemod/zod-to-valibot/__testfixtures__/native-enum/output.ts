import * as v from "valibot";

// TypeScript enum
enum Fruit {
	Orange,
	Apple = "apple",
	Banana = "banana",
}
const FruitEnum = v.enum(Fruit);

// object literal enum
const FruitObj = {
	Orange: 0,
	Apple: "apple",
	Banana: "banana",
} as const;
const FruitObjEnum = v.enum(FruitObj);

// access underlying object using `enum` property
enum Answer {
	Yes = "Yes",
	No = "No",
}
const NativeAnswerEnum = v.enum(Answer);
const AnswerEnum = NativeAnswerEnum.enum;