import { useWrpServer } from '@pbkit/wrp-react';
import { useEffect, useRef, useState } from 'react';
import { methodDescriptors } from '../generated/services/pbkit/wrp/example/WrpExampleService';
import {
  createPrimitiveWrpAtomSetAtom,
  useChannel,
} from '@pbkit/wrp-jotai/pwasa';
import { useIframeWrpAtomSetUpdateEffect } from '@pbkit/wrp-jotai/iframe';
import IframeExample from '../components/IframeExample';

export const pwasa = createPrimitiveWrpAtomSetAtom();

export default function WrpIframeExample() {
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
    <IframeExample
      iframeRef={iframeRef}
      sliderValue={sliderValue}
      setSliderValue={setSliderValue}
      text={text}
      setText={setText}
    />
  );
}
