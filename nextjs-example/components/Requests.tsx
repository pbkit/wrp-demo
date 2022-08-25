import { css } from "@emotion/react";
import styled from "@emotion/styled";
import * as React from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { MethodDescriptor } from "pbkit/core/runtime/rpc";
import { encodeBinary } from "@pbkit/wrp/generated/messages/pbkit/wrp/WrpMessage";
import { methodDescriptors } from "../generated/services/pbkit/wrp/example/WrpExampleService";
import { Message, messagesAtom } from "../pages/iframe-example.page";

const methods: { [methodName: string]: MethodDescriptor<any, any> } = {};
for (const method of Object.values(methodDescriptors)) {
  methods[method.service.serviceName + "/" + method.methodName] = method;
}

const requestsAtom = atom<RequestChipProps[]>((get) => {
  const messages = get(messagesAtom);
  return messagesToRequests(messages);
});
const bytesAtom = atom<number[][]>((get) => {
  const messages = get(messagesAtom);
  const sizeU8s = new Uint8Array(4);
  const dataView = new DataView(sizeU8s.buffer);
  return messages.map((message) => {
    const u8s = encodeBinary(message);
    dataView.setUint32(0, u8s.length, true);
    return [...sizeU8s, ...u8s];
  });
});
const requestBarScrollAtom = atom(0);
const channelBarScrollAtom = atom(0);
const bytesBarScrollAtom = atom(0);
const rclinksAtom = atom<Link[]>((get) => {
  const messages = get(messagesAtom);
  const rbs = get(requestBarScrollAtom);
  const cbs = get(channelBarScrollAtom);
  const rclinks = getRcLinks(messages, rbs, cbs);
  return rclinks;
});
const cblinksAtom = atom<Link[]>((get) => {
  const messages = get(messagesAtom);
  const bytes = get(bytesAtom);
  const cbs = get(channelBarScrollAtom);
  const bbs = get(bytesBarScrollAtom);
  const cblinks = getCbLinks(messages, bytes, cbs, bbs);
  return cblinks;
});
export default function Bars() {
  const rclinks = useAtomValue(rclinksAtom);
  const cblinks = useAtomValue(cblinksAtom);
  return (
    <div
      css={css({
        width: "100%",
        margin: "1em 0",
        fontSize: 0,
        "> *": {
          fontSize: `12px`,
        },
      })}
    >
      <RequestBar />
      <Links v={rclinks} />
      <ChannelBar />
      <Links v={cblinks} />
      <BytesBar />
    </div>
  );
}

function messagesToRequests(messages: Message[]): RequestChipProps[] {
  type Req = {
    methodName: string;
    props: RequestChipProps;
  };
  type Reqs = { [reqId: string]: Req };
  const p2cReqs: Reqs = {};
  const c2pReqs: Reqs = {};
  const result: RequestChipProps[] = [];
  for (const m of messages) {
    const message = m.message!;
    const type = m.type;
    switch (message.field) {
      case "HostInitialize": {
        result.push({
          reqId: "",
          [type]: "useWrpServer(...)",
        });
        break;
      }
      case "GuestReqStart": {
        const reqs = type === "p2c" ? p2cReqs : c2pReqs;
        const req: Req = {
          methodName: message.value.methodName,
          props: {
            reqId: message.value.reqId,
            [type]: `client.${methodName(message.value.methodName)}()`,
          },
        };
        reqs[message.value.reqId] = req;
        result.push(req.props);
        break;
      }
      case "HostResPayload": {
        const reqs = type === "p2c" ? c2pReqs : p2cReqs;
        if (!(message.value.reqId in reqs)) break;
        const req = reqs[message.value.reqId];
        const res = methods[req.methodName].responseType.deserializeBinary(
          message.value.payload,
        );
        req.props[type] = JSON.stringify(res);
        break;
      }
    }
  }
  return result;
}

function getRcLinks(messages: Message[], rbs: number, cbs: number): Link[] {
  type Reqs = {
    [reqId: string]: {
      reqIdx: number;
      mapping: { type: "p2c" | "c2p"; msgIdx: number }[];
    };
  };
  const reqs: Reqs = {};
  const linksBuilder = createLinksBuilder(220, 120, rbs, cbs);
  let reqIdx = 0;
  for (let msgIdx = 0; msgIdx < messages.length; ++msgIdx) {
    const { message, type } = messages[msgIdx];
    const reqId = "reqId" in message!.value ? message!.value.reqId : false;
    if (!reqId) {
      linksBuilder.push1(type, reqIdx++, msgIdx);
      continue;
    }
    if (reqId in reqs) {
      reqs[reqId].mapping.push({ type, msgIdx });
    } else {
      reqs[reqId] = {
        reqIdx: reqIdx++,
        mapping: [{ type, msgIdx }],
      };
    }
  }
  for (const reqId in reqs) {
    const req = reqs[reqId];
    for (let i = 0; i < req.mapping.length; ++i) {
      const l = req.mapping[i];
      linksBuilder.push1(l.type, req.reqIdx, l.msgIdx, req.mapping.length, i);
    }
  }
  return linksBuilder.get();
}

function getCbLinks(
  messages: Message[],
  bytes: number[][],
  cbs: number,
  bbs: number,
): Link[] {
  const linksBuilder = createLinksBuilder(120, 20, cbs, bbs);
  for (let i = 0; i < messages.length; ++i) {
    const { type } = messages[i];
    const b = bytes[i];
    linksBuilder.push2(type, i, 4, 2, 0);
    linksBuilder.push2(type, i, b.length - 4, 2, 1);
  }
  return linksBuilder.get();
}

interface LinksBuilder {
  push(t: "p2c" | "c2p", sb: number, se: number, eb: number, ee: number): void;
  push1(
    t: "p2c" | "c2p",
    sidx: number,
    eidx: number,
    sfcnt?: number,
    sfidx?: number,
  ): void;
  push2(
    t: "p2c" | "c2p",
    sidx: number,
    ecnt: number,
    sfcnt?: number,
    sfidx?: number,
  ): void;
  get(): Link[];
}
function createLinksBuilder(
  slen: number,
  elen: number,
  startOffset: number,
  endOffset: number,
  padding: number = 2,
): LinksBuilder {
  const result: Link[] = [];
  let _eb = 0;
  function push(
    t: "p2c" | "c2p",
    sb: number,
    se: number,
    eb: number,
    ee: number,
  ) {
    result.push({
      t,
      sb: sb + padding - startOffset,
      se: se - padding - startOffset,
      eb: eb + padding - endOffset,
      ee: ee - padding - endOffset,
    });
  }
  return {
    push,
    push1(t, sidx, eidx, sfcnt = 1, sfidx = 0) {
      const sflen = slen / sfcnt;
      const sfoff = sflen * sfidx;
      const sb = sidx * slen + sfoff;
      const eb = eidx * elen;
      push(t, sb, sb + sflen, eb, eb + elen);
    },
    push2(t, sidx, ecnt, sfcnt = 1, sfidx = 0) {
      const sflen = slen / sfcnt;
      const sfoff = sflen * sfidx;
      const sb = sidx * slen + sfoff;
      const se = sb + sflen;
      const eb = _eb;
      const ee = (_eb += ecnt * elen);
      push(t, sb, se, eb, ee);
    },
    get() {
      return result;
    },
  };
}

function methodName(fullName: string): string {
  const name = fullName.split("/").pop() || "method";
  return name[0].toLowerCase() + name.slice(1);
}

const RequestBar = () => {
  const ref = React.createRef<HTMLDivElement>();
  const set = useSetAtom(requestBarScrollAtom);
  const requests = useAtomValue(requestsAtom);
  return (
    <Bar
      ref={ref}
      onScroll={() => set(() => Number(ref.current?.scrollLeft))}
    >
      {requests.map((req, i) => {
        return <RequestChip key={i} {...req} />;
      })}
    </Bar>
  );
};

interface RequestChipProps {
  reqId: string;
  c2p?: string;
  p2c?: string;
}
const RequestChip: React.FC<RequestChipProps> = ({ c2p, p2c }) => {
  return (
    <div
      css={css({
        flexShrink: 0,
        boxSizing: "border-box",
        width: "220px",
        minHeight: "60px",
        padding: "0.5em 1em",
        border: "1px solid gray",
        borderRadius: "0.6em 0.6em 0 0",
        background: "lightgray",
      })}
    >
      {c2p && (
        <code>
          <span css={{ color: "red" }}>▼{" "}</span>
          {c2p}
        </code>
      )}
      {c2p && p2c && <hr />}
      {p2c && (
        <code>
          <span css={{ color: "blue" }}>▲{" "}</span>
          {p2c}
        </code>
      )}
    </div>
  );
};

const ChannelBar = () => {
  const ref = React.createRef<HTMLDivElement>();
  const set = useSetAtom(channelBarScrollAtom);
  const messages = useAtomValue(messagesAtom);
  return (
    <Bar
      ref={ref}
      onScroll={() => set(() => Number(ref.current?.scrollLeft))}
    >
      {messages.map((msg, i) => {
        return (
          <ChannelChip key={i} title={msg.message!.field}>
            {JSON.stringify(msg.message!.value, null, 1).slice(2, -2)}
          </ChannelChip>
        );
      })}
    </Bar>
  );
};

interface ChannelChipProps {
  title: string;
  children: React.ReactNode;
}
const ChannelChip: React.FC<ChannelChipProps> = ({ title, children }) => {
  return (
    <div
      css={css({
        flexShrink: 0,
        boxSizing: "border-box",
        width: "120px",
        height: "8em",
        padding: "0.5em 1em",
        border: "1px solid gray",
        background: "lightgray",
      })}
    >
      <span>{title}</span>
      <hr />
      <pre css={{ fontSize: "10px", overflowX: "hidden" }}>{children}</pre>
    </div>
  );
};

const BytesBar = () => {
  const ref = React.createRef<HTMLDivElement>();
  const set = useSetAtom(bytesBarScrollAtom);
  const bytes = useAtomValue(bytesAtom);
  return (
    <Bar
      ref={ref}
      onScroll={() => set(() => Number(ref.current?.scrollLeft))}
    >
      {bytes.map((b, i) => <BytesChip key={i} values={b} />)}
    </Bar>
  );
};

interface BytesChipProps {
  values: number[];
}
const BytesChip: React.FC<BytesChipProps> = ({ values }) => {
  return (
    <div
      css={css({
        flexShrink: 0,
        background: "lightgray",
        padding: "0.4em 0",
        paddingBottom: "15px",
        code: {
          display: "inline-block",
          width: "20px",
          textAlign: "center",
        },
      })}
    >
      {values.map((v, i) => (
        <code key={i}>{v.toString(16).toUpperCase().padStart(2, "0")}</code>
      ))}
    </div>
  );
};

interface BarProps {
  children?: React.ReactNode;
  onScroll?: React.HTMLAttributes<HTMLDivElement>["onScroll"];
}
const Bar = React.forwardRef<HTMLDivElement, BarProps>(
  function Bar({ children, onScroll }, ref) {
    return (
      <div
        ref={ref}
        onScroll={onScroll}
        css={css({
          display: "flex",
          overflowX: "scroll",
          overflowY: "hidden",
        })}
      >
        {children}
        <div css={css({ flex: "00 0 100%" })} />
      </div>
    );
  },
);

interface Link {
  t: "p2c" | "c2p";
  sb: number;
  se: number;
  eb: number;
  ee: number;
}
interface LinksProps {
  v: Link[];
}
const Links: React.FC<LinksProps> = ({ v }) => {
  const h = 60;
  const hh = h / 2;
  return (
    <svg
      css={{
        width: "100%",
        height: `${h}px`,
      }}
    >
      {v.map(({ t, sb, se, eb, ee }, i) => {
        const d =
          `M${sb},0L${se},0C${se},${hh} ${ee},${hh} ${ee},${h}L${eb},${h}C${eb},${hh} ${sb},${hh} ${sb},0Z`;
        return t === "p2c"
          ? <P2cLink key={i} d={d} />
          : <C2pLink key={i} d={d} />;
      })}
    </svg>
  );
};
const C2pLink = styled.path({
  fill: "red",
  fillOpacity: 0.4,
  stroke: "none",
});
const P2cLink = styled.path({
  fill: "blue",
  fillOpacity: 0.4,
  stroke: "none",
});
