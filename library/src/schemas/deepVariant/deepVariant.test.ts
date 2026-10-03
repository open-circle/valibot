import { assert, describe, expect, test,  } from "vitest";
import { deepVariant } from "./deepVariant";
import { object } from "../object";
import { literal } from "../literal";
import { number } from "../number";
import { parse } from "../../methods";
import { matchVariation } from "./matcher";

describe("deepVariant", () => {
  test("should parse two nodes and successfully handle them in matcher", () => {
    const NodeSchema = deepVariant('node.type', [
      object({
        node: object({
          type: literal("string")
        }),
        data: object({ minLength: number(), maxLength: number() })
      }),
      object({
        node: object({
          type: literal("number")
        }),
        data: object({ minValue: number(), maxValue: number() })
      })
    ]);

    const foo = parse(NodeSchema, {
      node: {
        type: "number"
      },
      data: {
        minValue: 5,
        maxValue: 5
      }
    });
    const bar = parse(NodeSchema, {
      node: {
        type: "string"
      },
      data: {
        minLength: 5,
        maxLength: 5
      }
    });

    matchVariation(foo, "node.type", {
      number(data) {
        console.log("Foo is a number!", { data });
      },
      string(data) {
        assert.fail("Foo should not get resolved to a string!")
      }
    });
    matchVariation(bar, "node.type", {
      number(data) {
        assert.fail("Bar should not get resolved to a number!")
      },
      string(data) {
        console.log("Bar is a string!", { data });
      }
    });

  })
})