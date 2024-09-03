import { CBOR } from "https://js.sabae.cc/CBOR.js";

export const getWebSocketURL = () => {
  if (!location) return "ws://127.0.0.1:8000/";
  return (location.protocol == "http:" ? "ws://" : "wss://") + location.host;
};

export const createWebSocketCBOR = (ws) => {
  const ws2 = {};
  ws.onopen = (e) => ws2.onopen(e);
  ws.onclose = (e) => ws2.onclose(e);
  ws.onerror = (e) => ws2.onerror(e);
  ws.onmessage = async (e) => {
    //console.log(e);
    const b = e.data;
    const e2 = { target: e.target, timeStamp: e.timeStamp };
    if (b instanceof ArrayBuffer) {
      e2.data = CBOR.decode(new Uint8Array(b));
    } else if (b instanceof Uint8Array) {
      e2.data = CBOR.decode(b);
    } else if (b instanceof Blob) {
      e2.data = CBOR.decode(new Uint8Array(await b.arrayBuffer()));
    } else {
      console.log("not supported e.data", b);
      ws2.onmessage(e);
      return;
    }
    ws2.onmessage(e2);
  };
  ws2.send = (data) => ws.send(CBOR.encode(data));
  return ws2;
};

export const createWebSocket = () => {
  const url = getWebSocketURL();
  const ws = new WebSocket(url);
  return createWebSocketCBOR(ws);
};

/*
const ws = createWebSocket();
ws.onopen = (e) => {
  console.log("CONNECTED");
  ws.send("ping");
};
ws.onclose = (e) => {
  console.log("DISCONNECTED");
};
ws.onmessage = (e) => {
  console.log(`RECEIVED: ${e.data}`);
};
ws.onerror = (e) => {
  console.log(`ERROR: ${e.data}`);
};
*/
