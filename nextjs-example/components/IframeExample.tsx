import React, { LegacyRef, useEffect, useState } from 'react';
import { store } from '../pages/_app.page';
import Frame from './Frame';
import { useSnapshot } from 'valtio';
import Message from './Message';
import { Type as WrpMessage } from '@pbkit/wrp/generated/messages/pbkit/wrp/WrpMessage';

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
  const snapshot = useSnapshot(store);
  return (
    <div className="flex justify-center">
      <div className="w-[32rem] p-4 border-r border-gray-300 flex flex-col items-center">
        <p>
          You can use pbkit{' '}
          <a
            className="text-blue-500 font-bold"
            href="https://chrome.google.com/webstore/detail/pbkit-devtools/fjacmiijeihblfhobghceofniolonhca"
            target="_blank"
            rel="noreferrer"
          >
            chrome devtools
          </a>{' '}
          here!
        </p>
        <p className="cursor-pointer" onClick={() => setIsFold(v => !v)}>
          Show protobuf schema in this example {isFold ? '▼' : '▲'}
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
                  onInput={e => setSliderValue(+(e.target as any).value)}
                />
              </label>
              <label className="flex items-center rounded p-4 gap-4 bg-green-100">
                <b>TextValue</b>
                <input
                  type="text"
                  className="p-1 border border-black w-full"
                  value={text}
                  onInput={e => setText((e.target as any).value)}
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
            className="w-[30rem] h-[24rem] resize border border-black"
            ref={iframeRef}
            src="/client-only"
          />
        </div>
      </div>
      <div className="w-[32rem] min-h-screen">
        <div className="flex flex-col h-screen gap-2 items-start overflow-y-scroll p-4">
          <p className="self-center">See WRP packets here!</p>
          {snapshot.payloads.map(([type, data], index) => {
            switch (type) {
              case 'send':
                return (
                  <div key={index} className="rounded bg-blue-100">
                    <Message message={data as WrpMessage} />
                  </div>
                );
              case 'recv':
                return (
                  <div
                    key={index}
                    className="rounded bg-red-100 self-end text-right"
                  >
                    <Message message={data as WrpMessage} />
                  </div>
                );
            }
          })}
        </div>
      </div>
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
