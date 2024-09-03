class Group {
  name;
  cam = null;
  running = false;
  clients = [];
  constructor(name) {
    this.name = name;
  }
  startCam() {
    try {
      this.cam.send({ type: "start_cam" });
      console.log("start cam");
      this.running = true;
    } catch (e) {
      console.log("can't start cam");
    }
  }
  stopCam() {
    if (this.running) {
      this.running = false;
      try {
        this.cam.send({ type: "stop_cam" });
      } catch (e) {}
      console.log("stop cam");
    }
  }
}

const groups = {};
const getGroup = (name) => {
  if (!name) name = "default";
  const g = groups[name];
  if (g) return g;
  const g2 = (groups[name] = new Group(name));
  return g2;
};

export const handleWebSocket = (socket) => {
  socket.onopen = () => {
    console.log("CONNECTED");
  };
  socket.onmessage = (event) => {
    const data = event.data;
    const g = getGroup(data.group);
    if (!g) return;
    const t = data.type;
    //console.log(data, t);
    // console.log(g.name, t);

    if (t == "init_cam") {
      if (g.cam) {
        g.stopCam();
      }
      g.cam = socket;
      if (g.clients.length > 0) {
        g.startCam();
      }
    } else if (t == "init_client") {
      if (g.cam && !g.running) {
        g.startCam();
      }
      g.clients.push(socket);
    } else if (t == "cam_image") {
      //console.log("img transfer", g.clients.length);
      g.clients.forEach((i) => {
        try {
          i.send({ type: "cam_image", img: data.img });
        } catch (e) {}
      });
    }
  };
  socket.onclose = () => {
    A: for (const name in groups) {
      const g = groups[name];
      for (let i = 0; i < g.clients.length; i++) {
        if (g.clients[i] == socket) {
          g.clients.splice(i, 1);
          if (g.clients.length == 0) {
            g.stopCam();
          }
          break A;
        }
      }
    }
    console.log("DISCONNECTED");
  };
  socket.onerror = (error) => console.error("ERROR:", error);
};
