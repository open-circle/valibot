import { z } from "zod";

// TypeScript enum
enum Fruit {
	Orange,
	Apple = "apple",
	Banana = "banana",
}
const FruitEnum = z.nativeEnum(Fruit);

// object literal enum
const FruitObj = {
	Orange: 0,
	Apple: "apple",
	Banana: "banana",
} as const;
const FruitObjEnum = z.nativeEnum(FruitObj);

// access underlying object using `enum` property
enum Answer {
	Yes = "Yes",
	No = "No",
}
const NativeAnswerEnum = z.nativeEnum(Answer);
const AnswerEnum = NativeAnswerEnum.enum;