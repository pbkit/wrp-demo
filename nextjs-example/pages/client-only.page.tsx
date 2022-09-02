import { atom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { clientImplAtom } from "@pbkit/wrp-jotai/parent";
import { createServiceClient } from "../generated/services/pbkit/wrp/example/WrpExampleService";
import Frame from "../components/Frame";

const serviceClientAtom = atom((get) => {
  const clientImpl = get(clientImplAtom);
  if (!clientImpl) return;
  return createServiceClient(clientImpl, {
    devtools: { tags: ["WrpClient"] },
  });
});

export default function ClientOnlyPage() {
  const [sliderValue, setSliderValue] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  const serviceClient = useAtomValue(serviceClientAtom);
  const onClick = async () => {
    alert((await serviceClient?.getTextValue({}))?.text);
  };
  useEffect(() => {
    if (!serviceClient) return;
    let unmounted = false;
    (async () => {
      for await (const { value } of await serviceClient.getSliderValue({})) {
        if (unmounted) return;
        setSliderValue(value);
        setResponseCount((c) => c + 1);
      }
    })();
    return () => void (unmounted = true);
  }, [serviceClient]);
  return (
    <Frame
      title="Client (Guest)"
      sourceCodeUrl="https://github.com/pbkit/wrp-demo/blob/main/nextjs-example/pages/client-only.page.tsx#L7-L33"
    >
      <div className="flex flex-col items-center gap-4 p-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="flex flex-col items-center rounded bg-blue-100 p-4">
              <b>Slider value</b>
              <p className="text-4xl">{sliderValue}</p>
            </label>
            <label className="flex flex-col items-center rounded bg-red-100 p-4">
              <b># of responses (GetSliderValue)</b>
              <p className="text-4xl">{responseCount}</p>
            </label>
          </div>
          <div className="w-full flex-1 flex flex-col items-center gap-2">
            <button
              className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
              onClick={onClick}
            >
              Get TextValue from Server
            </button>
            <button
              className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded"
              onClick={() => location.reload()}
            >
              Refresh page to reset
            </button>
          </div>
        </div>
      </div>
    </Frame>
  );
}
