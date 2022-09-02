import { atom, useSetAtom } from "jotai";
import { rpc, useWrpServer } from "@pbkit/wrp-react/server";
import { useState } from "react";
import { methodDescriptors } from "../generated/services/pbkit/wrp/example/WrpExampleService";
import { Socket } from "@pbkit/wrp/socket";
import { createWrpChannel, WrpChannel } from "@pbkit/wrp/channel";
import { Type as WrpMessage } from "@pbkit/wrp/generated/messages/pbkit/wrp/WrpMessage";
import {
  createPrimitiveWrpAtomSetAtom,
  useChannel,
} from "@pbkit/wrp-jotai/pwasa";
import { useIframeWrpAtomSetUpdateEffect } from "@pbkit/wrp-jotai/iframe";
import IframeExample from "../components/IframeExample";

export const pwasa = createPrimitiveWrpAtomSetAtom();
export type Message = WrpMessage & { type: "p2c" | "c2p" };
export const messagesAtom = atom<Message[]>([]);

export default function WrpIframeExample() {
  const [sliderValue, setSliderValue] = useState(50);
  const [text, setText] = useState("Hello World");
  const setMessages = useSetAtom(messagesAtom);
  const { iframeRef } = useIframeWrpAtomSetUpdateEffect(
    pwasa,
    (socket: Socket): WrpChannel => {
      const channel = createWrpChannel(socket);
      return {
        send: (msg) => {
          setMessages((msgs) => [...msgs, { type: "p2c", ...msg }]);
          return channel.send(msg);
        },
        async *listen() {
          for await (const msg of channel.listen()) {
            setMessages((msgs) => [...msgs, { type: "c2p", ...msg }]);
            yield msg;
          }
        },
      };
    },
  );
  const channel = useChannel(pwasa);
  useWrpServer(
    channel,
    { sliderValue, text },
    rpc(
      methodDescriptors.getSliderValue,
      async function* ({ req, getState, stateChanges }) {
        const { sliderValue: value } = getState();
        yield { value };
        for await (const value of stateChanges.sliderValue) yield { value };
      },
    ),
    rpc(
      methodDescriptors.getTextValue,
      async function ({ req, getState }) {
        const { text } = getState();
        return { text };
      },
    ),
  );
  return (
    <IframeExample
      iframeRef={iframeRef}
      sliderValue={sliderValue}
      setSliderValue={setSliderValue}
      text={text}
      setText={setText}
    />
  );
}
