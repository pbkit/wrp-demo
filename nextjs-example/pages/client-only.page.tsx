import { useState, useMemo, useEffect } from 'react';
import { useClientImpl } from '@pbkit/wrp-jotai/parent';
import { createServiceClient } from '../generated/services/pbkit/wrp/example/WrpExampleService';

export default function ClientOnlyPage() {
  const [sliderValue, setSliderValue] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  const clientImpl = useClientImpl();
  const serviceClient = useMemo(() => {
    if (!clientImpl) return;
    return createServiceClient(clientImpl, {
      devtools: { tags: ['WrpClient'] },
    });
  }, [clientImpl]);
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
        setResponseCount(c => c + 1);
      }
    })();
    return () => void (unmounted = true);
  }, [serviceClient]);
  return (
    <div className="flex flex-col items-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">WrpExampleClient (Guest)</h1>
      <p>GetSliderValue is requested on initialized</p>
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
  );
}
