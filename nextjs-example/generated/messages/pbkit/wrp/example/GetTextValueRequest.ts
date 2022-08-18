import { WireMessage } from "../../../../runtime/wire/index";
import { default as serialize } from "../../../../runtime/wire/serialize";
import { default as deserialize } from "../../../../runtime/wire/deserialize";

export declare namespace $.pbkit.wrp.example {
  export interface GetTextValueRequest {}
}
export type Type = $.pbkit.wrp.example.GetTextValueRequest;

export function getDefaultValue(): $.pbkit.wrp.example.GetTextValueRequest {
  return {};
}

export function createValue(
  partialValue: Partial<$.pbkit.wrp.example.GetTextValueRequest>,
): $.pbkit.wrp.example.GetTextValueRequest {
  return {
    ...getDefaultValue(),
    ...partialValue,
  };
}

export function encodeJson(
  value: $.pbkit.wrp.example.GetTextValueRequest,
): unknown {
  const result: any = {};
  return result;
}

export function decodeJson(
  value: any,
): $.pbkit.wrp.example.GetTextValueRequest {
  const result = getDefaultValue();
  return result;
}

export function encodeBinary(
  value: $.pbkit.wrp.example.GetTextValueRequest,
): Uint8Array {
  const result: WireMessage = [];
  return serialize(result);
}

export function decodeBinary(
  binary: Uint8Array,
): $.pbkit.wrp.example.GetTextValueRequest {
  const result = getDefaultValue();
  const wireMessage = deserialize(binary);
  const wireFields = new Map(wireMessage);
  return result;
}
