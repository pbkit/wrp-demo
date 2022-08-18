import {
  jsonValueToTsValueFns,
  tsValueToJsonValueFns,
} from "../../../../runtime/json/scalar";
import { WireMessage } from "../../../../runtime/wire/index";
import { default as serialize } from "../../../../runtime/wire/serialize";
import {
  tsValueToWireValueFns,
  wireValueToTsValueFns,
} from "../../../../runtime/wire/scalar";
import { default as deserialize } from "../../../../runtime/wire/deserialize";

export declare namespace $.pbkit.wrp.example {
  export interface GetSliderValueResponse {
    value: number;
  }
}
export type Type = $.pbkit.wrp.example.GetSliderValueResponse;

export function getDefaultValue(): $.pbkit.wrp.example.GetSliderValueResponse {
  return {
    value: 0,
  };
}

export function createValue(
  partialValue: Partial<$.pbkit.wrp.example.GetSliderValueResponse>,
): $.pbkit.wrp.example.GetSliderValueResponse {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(
  value: $.pbkit.wrp.example.GetSliderValueResponse,
): unknown {
  const result: any = {};
  if (value.value !== undefined) {
    result.value = tsValueToJsonValueFns.int32(value.value);
  }
  return result;
}

export function decodeJson(
  value: any,
): $.pbkit.wrp.example.GetSliderValueResponse {
  const result = getDefaultValue();
  if (value.value !== undefined) {
    result.value = jsonValueToTsValueFns.int32(value.value);
  }
  return result;
}

export function encodeBinary(
  value: $.pbkit.wrp.example.GetSliderValueResponse,
): Uint8Array {
  const result: WireMessage = [];
  if (value.value !== undefined) {
    const tsValue = value.value;
    result.push(
      [1, tsValueToWireValueFns.int32(tsValue)],
    );
  }
  return serialize(result);
}

export function decodeBinary(
  binary: Uint8Array,
): $.pbkit.wrp.example.GetSliderValueResponse {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  field: {
    const wireValue = wireFields.get(1);
    if (wireValue === undefined) break field;
    const value = wireValueToTsValueFns.int32(wireValue);
    if (value === undefined) break field;
    result.value = value;
  }
  return result;
}
