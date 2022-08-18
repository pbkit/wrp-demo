import { useWrpServer } from '@pbkit/wrp-react';
import { useState } from 'react';
import { methodDescriptors } from '../generated/services/pbkit/wrp/example/WrpExampleService';
import {
  createPrimitiveWrpAtomSetAtom,
  useChannel,
} from '@pbkit/wrp-jotai/pwasa';
import { useIframeWrpAtomSetUpdateEffect } from '@pbkit/wrp-jotai/iframe';

export const pwasa = createPrimitiveWrpAtomSetAtom();

export default function WrpIframeHost() {
  const [isFold, setIsFold] = useState(true);
  const [sliderValue, setSliderValue] = useState(50);
  const [text, setText] = useState('Hello World');
  const { iframeRef } = useIframeWrpAtomSetUpdateEffect(pwasa);
  const channel = useChannel(pwasa);
  useWrpServer(channel, { sliderValue, text }, [
    [
      methodDescriptors.getSliderValue,
      ({ req, res, getState, stateChanges }) => {
        res.header({});
        const value = getState().sliderValue;
        res.send({ value });
        const off = stateChanges.on('sliderValue', value =>
          res.send({ value })
        );
        req.metadata?.on('cancel-response', teardown);
        req.metadata?.on('close', teardown);
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
    <>
      <div className="flex flex-col items-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">WrpExampleServer (Host)</h1>
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
        <code
          className={`whitespace-pre-wrap p-4 bg-gray-100 text-left ${
            isFold ? `hidden` : ''
          }`}
        >
          {proto}
        </code>
        <div className="flex flex-col gap-4">
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
              className="p-1"
              value={text}
              onInput={e => setText((e.target as any).value)}
            />
          </label>
        </div>
        <div>
          <h2 className="text-2xl font-bold my-4">iframe</h2>
          <iframe ref={iframeRef} src="/client-only" />
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            label > span {
              margin-right: 1em;
            }
            input[type=text] {
              border: 1px solid black;
            }
            iframe {
              width: 500px;
              height: 400px;
              border: 1px solid black;
              resize: both;
            }
          `,
        }}
      />
    </>
  );
}

const proto = `syntax = "proto3";
package pbkit.wrp.example;

service WrpExampleService {
  rpc GetTextValue(GetTextValueRequest) returns (GetTextValueResponse);
  rpc GetSliderValue(GetSliderValueRequest) returns (stream GetSliderValueResponse);
}

message GetTextValueRequest {}
message GetTextValueResponse {
  string text = 1;
}
message GetSliderValueRequest {}
message GetSliderValueResponse {
  int32 value = 1;
}`;
