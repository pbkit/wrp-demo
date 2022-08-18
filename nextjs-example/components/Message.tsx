import React, { useState } from 'react';
import { Type as WrpMessage } from '@pbkit/wrp/generated/messages/pbkit/wrp/WrpMessage';
import { decodeBinary as decodeSliderRequest } from '../generated/messages/pbkit/wrp/example/GetSliderValueRequest';
import { decodeBinary as decodeTextRequest } from '../generated/messages/pbkit/wrp/example/GetTextValueRequest';
import { decodeBinary as decodeSliderResponse } from '../generated/messages/pbkit/wrp/example/GetSliderValueResponse';
import { decodeBinary as decodeTextResponse } from '../generated/messages/pbkit/wrp/example/GetTextValueResponse';
import { proxy, useSnapshot } from 'valtio';

const store = proxy<string[]>([]);

interface MessageProps {
  message: WrpMessage;
}
const Message: React.FC<MessageProps> = ({ message, ...props }) => {
  const snapshot = useSnapshot(store);
  const content = (() => {
    switch (message.message?.field) {
      case 'HostInitialize': {
        return (
          <>
            <p className="font-bold">Avaliable methods list below:</p>
            {message.message.value.availableMethods.map(methodName => (
              <p key={methodName}>{methodName}</p>
            ))}
          </>
        );
      }
      case 'HostResStart': {
        const reqId = Number(message.message.value.reqId);
        return (
          <span
            className={`ml-2 px-2 w-fit rounded-full text-white font-bold`}
            style={{ backgroundColor: colors[reqId % colors.length] }}
          >
            id: {reqId}
          </span>
        );
      }
      case 'HostResPayload': {
        const reqId = Number(message.message.value.reqId);
        const payload = message.message.value.payload;
        const decodeBinary = (() => {
          switch (snapshot[reqId]) {
            case 'GetTextValue':
              return decodeTextResponse;
            case 'GetSliderValue':
              return decodeSliderResponse;
          }
        })();
        return (
          <>
            <span
              className={`ml-2 px-2 w-fit rounded-full text-white font-bold`}
              style={{ backgroundColor: colors[reqId % colors.length] }}
            >
              id: {reqId}
            </span>
            <div>{JSON.stringify(decodeBinary?.(payload))}</div>
          </>
        );
      }
      case 'HostResFinish': {
        const reqId = Number(message.message.value.reqId);
        return (
          <span
            className={`ml-2 px-2 w-fit rounded-full text-white font-bold`}
            style={{ backgroundColor: colors[reqId % colors.length] }}
          >
            id: {reqId}
          </span>
        );
      }
      case 'GuestReqStart': {
        const reqId = Number(message.message.value.reqId);
        const methodName = message.message.value.methodName;
        store[reqId] = methodName.split('/').pop()!;
        return (
          <>
            <span
              className={`ml-2 px-2 w-fit rounded-full text-white font-bold`}
              style={{ backgroundColor: colors[reqId % colors.length] }}
            >
              id: {reqId}
            </span>
            <p>
              We will use <span className="font-bold">id {reqId}</span> for this
              request
            </p>
            <p>
              Request for <span className="font-bold">{methodName}</span>
            </p>
          </>
        );
      }
      case 'GuestReqPayload': {
        const reqId = Number(message.message.value.reqId);
        const payload = message.message.value.payload;
        const decodeBinary = (() => {
          switch (snapshot[reqId]) {
            case 'GetTextValue':
              return decodeTextRequest;
            case 'GetSliderValue':
              return decodeSliderRequest;
          }
        })();
        return (
          <>
            <span
              className={`ml-2 px-2 w-fit rounded-full text-white font-bold`}
              style={{ backgroundColor: colors[reqId % colors.length] }}
            >
              id: {reqId}
            </span>
            <div>{JSON.stringify(decodeBinary?.(payload))}</div>
          </>
        );
      }
      case 'GuestReqFinish': {
        const reqId = Number(message.message.value.reqId);
        return (
          <span
            className={`ml-2 px-2 w-fit rounded-full text-white font-bold`}
            style={{ backgroundColor: colors[reqId % colors.length] }}
          >
            id: {reqId}
          </span>
        );
      }
    }
  })();
  return (
    <div className="min-w-[24rem] p-2">
      <span className="font-bold">{message.message?.field}</span>
      <span className="text-sm">{content}</span>
    </div>
  );
};

export default Message;

const colors = [
  '#765898',
  '#e0afd7',
  '#e10000',
  '#00ee00',
  '#555580',
  '#805580',
  '#550080',
  '#8000aa',
  '#008055',
  '#00aa80',
  '#80aa80',
  '#558055',
  '#808055',
  '#aaaa80',
  '#55ff80',
  '#80ff55',
  '#558000',
  '#80aa00',
  '#805555',
  '#800055',
  '#aa0080',
  '#aa80ff',
  '#8055ff',
  '#805500',
  '#aa4000',
  '#aa8000',
  '#1eee11',
  '#f3ada4',
  '#dec2cb',
  '#c5b9cd',
  '#f7d0cb',
  '#dea3bd',
  '#cc99cc',
  '#ff9f00',
  '#ff5800',
  '#b03060',
  '#ff34b3',
  '#ee30a7',
  '#cd2990',
  '#8b1c62',
  '#a50b5e',
  '#4b0082',
];
