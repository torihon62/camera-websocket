import { handleWeb } from "https://code4fukui.github.io/wsutil/handleWeb.js";
import { createWebSocketCBOR } from "./static/createWebSocket.js";
import { handleWebSocket } from "./handleWebSocket.js";

const port = Deno.args[0] || 8000;

Deno.serve({
  port,
  hostname: "[::]",
  handler: async (request, info) => {
    if (request.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(request);
      handleWebSocket(createWebSocketCBOR(socket));
      return response;
    } else {
      const path = new URL(request.url).pathname;
      return handleWeb("static", request, path, info);
    }
  },
});
