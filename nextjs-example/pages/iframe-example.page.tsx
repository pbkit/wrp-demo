import { atom, useSetAtom } from "jotai";
import { useWrpServer } from "@pbkit/wrp-react";
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
  useWrpServer(channel, { sliderValue, text }, [
    [
      methodDescriptors.getSliderValue,
      ({ req, res, getState, stateChanges }) => {
        res.header({});
        const value = getState().sliderValue;
        res.send({ value });
        const off = stateChanges.on(
          "sliderValue",
          (value) => res.send({ value }),
        );
        req.metadata?.on("cancel-response", teardown);
        req.metadata?.on("close", teardown);
        function teardown() {
          off();
          res.end({});
        }
      },
    ],
    [
      methodDescriptors.getTextValue,
      ({ res, getState }) => {
        const { text } = getState();
        res.header({});
        res.send({ text });
        res.end({});
      },
    ],
  ]);
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
