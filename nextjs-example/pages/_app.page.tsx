import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { GlueEvent, isGlueEvent } from '@pbkit/wrp/glue';
import { str2u8s } from '@pbkit/wrp/glue/misc';
import { proxy } from 'valtio';
import {
  Type as WrpMessage,
  decodeBinary,
} from '@pbkit/wrp/generated/messages/pbkit/wrp/WrpMessage';

export const store = proxy<{ len: number; payloads: [string, WrpMessage][] }>({
  len: 0,
  payloads: [],
});

const reflectKey = '<reflect>';
if (typeof window !== 'undefined') {
  if (window === window.parent) {
    window.addEventListener('message', event => {
      if (!isGlueOrReflectEvent(event)) return;
      const [, isHandshakeMessage, payload] = event.data;
      if (isHandshakeMessage) return;
      if (isGlueEvent(event)) {
        store.payloads.push([
          'recv',
          decodeBinary((payload as Uint8Array).subarray(4)),
        ]);
      }
      if (isReflectEvent(event)) {
        store.payloads.push([
          'send',
          decodeBinary((payload as Uint8Array).subarray(4)),
        ]);
      }
    });
  } else {
    window.addEventListener('message', event => {
      if (!isGlueEvent(event)) return;
      const [, isHandshakeMessage, payload] = event.data;
      if (isHandshakeMessage) return;
      window.parent.postMessage([reflectKey, isHandshakeMessage, payload], '*');
    });
  }
  function isReflectEvent(event: any): event is GlueEvent {
    if (!Array.isArray(event.data)) return false;
    if (event.data.length < 3) return false;
    if (event.data[0] !== reflectKey) return false;
    return true;
  }
  function isGlueOrReflectEvent(event: any): event is GlueEvent {
    return isGlueEvent(event) || isReflectEvent(event);
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
