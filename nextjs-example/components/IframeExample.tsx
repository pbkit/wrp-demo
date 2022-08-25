import { css } from "@emotion/react";
import React, { LegacyRef, useState } from "react";
import Frame from "./Frame";
import { useAtomValue } from "jotai";
import { messagesAtom } from "../pages/iframe-example.page";
import Message from "./Message";
import Requests from "./Requests";

interface IframeExampleProps {
  sliderValue: number;
  setSliderValue(value: number): void;
  text: string;
  setText(value: string): void;
  iframeRef: LegacyRef<HTMLIFrameElement>;
}

const IframeExample: React.FC<IframeExampleProps> = ({
  sliderValue,
  setSliderValue,
  text,
  setText,
  iframeRef,
}) => {
  const [isFold, setIsFold] = useState(true);
  const messages = useAtomValue(messagesAtom);
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <div className="w-[32rem] p-4 border-r border-b border-gray-300 flex flex-col items-center">
          <p>
            You can use pbkit{" "}
            <a
              className="text-blue-500 font-bold"
              href="https://chrome.google.com/webstore/detail/pbkit-devtools/fjacmiijeihblfhobghceofniolonhca"
              target="_blank"
              rel="noreferrer"
            >
              chrome devtools
            </a>{" "}
            here!
          </p>
          <p className="cursor-pointer" onClick={() => setIsFold((v) => !v)}>
            Show protobuf schema in this example {isFold ? "▼" : "▲"}
          </p>
          {!isFold && (
            <div className="bg-gray-100 p-2">
              <code className={`whitespace-pre-wrap text-left`}>{proto}</code>
            </div>
          )}
          <Frame title="Server (Host)">
            <div className="flex flex-col items-center gap-4 p-4 text-center">
              <div className="flex flex-col gap-4 w-full">
                <label className="flex items-center rounded p-4 gap-4 bg-blue-100">
                  <b>SliderValue</b>
                  <input
                    type="range"
                    className="w-full"
                    value={sliderValue}
                    min="0"
                    max="100"
                    onInput={(e) => setSliderValue(+(e.target as any).value)}
                  />
                </label>
                <label className="flex items-center rounded p-4 gap-4 bg-green-100">
                  <b>TextValue</b>
                  <input
                    type="text"
                    className="p-1 border border-black w-full"
                    value={text}
                    onInput={(e) => setText((e.target as any).value)}
                  />
                </label>
              </div>
            </div>
          </Frame>
          <div className="w-[30rem] mx-auto">
            <p className="mx-4 bg-gray-200 p-2 rounded-t-lg text-lg font-bold w-fit">
              iframe
            </p>
            <iframe
              className="w-[30rem] h-[24rem] border border-black"
              ref={iframeRef}
              src="/client-only"
            />
          </div>
        </div>
        <div
          className="w-[32rem] border-b border-gray-300"
          css={css({
            position: "relative",
            overflowY: "scroll",
          })}
        >
          <div
            css={css({
              position: "absolute",
              width: "100%",
            })}
          >
            <div className="flex flex-col gap-2 items-start p-4">
              <p className="self-center">
                See the messages of WRP channel here!
              </p>
              {messages.map((message, index) => {
                switch (message.type) {
                  case "p2c":
                    return (
                      <div key={index} className="rounded bg-blue-100">
                        <Message message={message} />
                      </div>
                    );
                  case "c2p":
                    return (
                      <div
                        key={index}
                        className="rounded bg-red-100 self-end text-right"
                      >
                        <Message message={message} />
                      </div>
                    );
                }
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-[64rem] p-4">
          <Requests />
        </div>
      </div>
      <div css={css({ height: "50vh" })} />
    </div>
  );
};

export default IframeExample;

const proto = `syntax = "proto3";
package pbkit.wrp.example;

service WrpExampleService {
  rpc GetTextValue(GetTextValueRequest)
    returns (GetTextValueResponse);
  rpc GetSliderValue(GetSliderValueRequest)
    returns (stream GetSliderValueResponse);
}

message GetTextValueRequest {}
message GetTextValueResponse {
  string text = 1;
}
message GetSliderValueRequest {}
message GetSliderValueResponse {
  int32 value = 1;
}`;
