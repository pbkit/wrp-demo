import { useState } from "react";
import { rpc, useWrpServer } from "@pbkit/wrp-react/server";
import { useChannel } from "@pbkit/wrp-jotai/parent";
import { methodDescriptors } from "../generated/services/pbkit/wrp/example/WrpExampleService";

export default function ServerOnlyPage() {
  const [sliderValue, setSliderValue] = useState(50);
  const [text, setText] = useState("Hello World");
  const channel = useChannel();
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
    main: `flex flex-col items-center gap-4 p-4 text-center`,
    button: (color: string) =>
      `w-full bg-${color}-400 hover:bg-${color}-500 text-white font-bold py-2 px-4 rounded`,
    label: (color: string) =>
      `flex flex-col items-center rounded bg-${color}-100 p-4 gap-4`,
  };
  return (
    <>
      <div className={styles.main}>
        <h1 className="text-2xl font-bold">WrpExampleServer (Host)</h1>
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
              className="p-2"
              value={text}
              onInput={(e) => setText((e.target as any).value)}
            />
          </label>
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
