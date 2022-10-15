import { atom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { rpc, useWrpServer } from "@pbkit/wrp-react/server";
import {
  createServiceClient,
  methodDescriptors,
} from "../generated/services/pbkit/wrp/example/WrpExampleService";
import { clientImplAtom, useChannel } from "@pbkit/wrp-jotai/parent";

const serviceClientAtom = atom((get) => {
  const clientImpl = get(clientImplAtom);
  if (!clientImpl) return;
  return createServiceClient(clientImpl, {
    devtools: { tags: ["WrpClient"] },
  });
});

export default function ServerAndClientPage() {
  const [sliderValue, setSliderValue] = useState(50);
  const [recvSliderValue, setRecvSliderValue] = useState(50);
  const [responseCount, setResponseCount] = useState(0);
  const [text, setText] = useState("Hello World");
  const channel = useChannel();
  const serviceClient = useAtomValue(serviceClientAtom);
  useEffect(() => {
    if (!serviceClient) return;
    let unmounted = false;
    (async () => {
      for await (const { value } of await serviceClient.getSliderValue({})) {
        if (unmounted) return;
        setRecvSliderValue(value);
        setResponseCount((c) => c + 1);
      }
    })();
    return () => void (unmounted = true);
  }, [serviceClient]);
  const onClick = async () => {
    alert((await serviceClient?.getTextValue({}))?.text);
  };
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
  const styles = {
    main: `flex flex-col items-center gap-2 p-2 text-center`,
    button: (color: string) =>
      `w-full bg-${color}-400 hover:bg-${color}-500 text-white font-bold py-2 px-4 rounded`,
    label: (color: string) =>
      `w-full flex items-center rounded bg-${color}-100 p-2 gap-2`,
  };
  return (
    <>
      <div className={styles.main}>
        <h1 className="text-xl font-bold">WrpExampleServer (Host)</h1>
        <div className="flex flex-col gap-4">
          <label className={styles.label("blue")}>
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
          <label className={styles.label("green")}>
            <b>TextValue</b>
            <input
              type="text"
              className="p-1"
              value={text}
              onInput={(e) => setText((e.target as any).value)}
            />
          </label>
        </div>
      </div>
      <div className={styles.main}>
        <h1 className="text-xl font-bold">WrpExampleClient (Guest)</h1>
        <p>GetSliderValue is requested on initialized</p>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <label className={styles.label("blue")}>
              <b>Slider value</b>
              <p className="text-4xl">{recvSliderValue}</p>
            </label>
            <label className={styles.label("red")}>
              <b># of responses (GetSliderValue)</b>
              <p className="text-4xl">{responseCount}</p>
            </label>
          </div>
          <div className="w-full flex-1 flex flex-col items-center gap-2">
            <button className={styles.button("blue")} onClick={onClick}>
              Get TextValue from Server
            </button>
            <button
              className={styles.button("orange")}
              onClick={() => location.reload()}
            >
              Refresh page to reset
            </button>
          </div>
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
      `,
        }}
      />
    </>
  );
}
