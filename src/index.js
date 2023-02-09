const express = require("express");
const session = require("express-session");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.Server(app);
const io = socketIo(server);

const PORT = 3000;
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
    maxage: 2000 * 60 * 30,
  })
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/create-session", (req, res) => {
  // console.log(req.sessionID);
  req.session[req.sessionID] = "isMaster";
  req.session.name = 1111;
  res.json({
    sessionID: req.sessionID,
    isMaster: true,
  });
});
app.get("/get-role", (req, res) => {
  console.log(req.query.masterSession);
  let isMaster = false;
  if (req.session[req.sessionID] && req.query.masterSession == req.sessionID) {
    isMaster = true;
  }
  console.log(req.session);
  console.log(req.sessionID);
  res.json({
    isMaster: isMaster,
  });
});

app.get("/script.js", (req, res) => {
  res.sendFile(__dirname + "/script.js");
});
app.get("/util.js", (req, res) => {
  res.sendFile(__dirname + "/util.js");
});
app.get("/main.js", (req, res) => {
  res.sendFile(__dirname + "/main.js");
});
server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
let sessionTest = "";
io.on("connection", (socket) => {
  // チャット
  socket.on("sendMessage", (message) => {
    // sessionTest = message.session;
    if (message.session) {
      socket.join(message.session);
    }
    // console.log("sendmessage", socket.rooms);
    // 'receiveMessage' というイベントを発火、受信したメッセージを全てのクライアントに対して送信する
    io.to(message.session).emit("receiveMessage", message);
  });
  socket.on("joinRoom", (randNum) => {
    socket.join(randNum);
  });
  // 60秒送る
  socket.on("sendTime", (time) => {
    if (time.session) {
      socket.join(time.session);
    }
    // console.log("sendTime", socket.rooms);
    // 'receivetime' というイベントを発火、受信したメッセージを全てのクライアントに対して送信する
    io.to(time.session).emit("receiveTime", time.time);
    // io.emit("receiveTime", time);
  });
  // シークバーの位置に送る
  socket.on("sendTimeBySeekBar", (time) => {
    if (time.session) {
      socket.join(time.session);
    }
    // console.log("sendTime", socket.rooms);
    // 'receivetime' というイベントを発火、受信したメッセージを全てのクライアントに対して送信する
    io.to(time.session).emit("receiveTimeBySeekBar", time.time);
    // io.emit("receiveTime", time);
  });
  // 停止
  socket.on("stopVIdeo", (stopVideo) => {
    if (stopVideo.session) {
      socket.join(stopVideo.session);
    }
    // console.log("stopVideo", socket.rooms);
    io.to(stopVideo.session).emit("receiveStopTime");
  });
  // 再生
  socket.on("playTime", (playTime) => {
    if (playTime.session) {
      socket.join(playTime.session);
    }
    // console.log("playTime", socket.rooms);
    io.to(playTime.session).emit("receivePlayTime");
  });
  // 60秒戻す
  socket.on("prevTime", (prevTime) => {
    if (prevTime.session) {
      socket.join(prevTime.session);
    }
    // console.log("prevTime", socket.rooms);
    io.to(prevTime.session).emit("receivePrevTime", prevTime.time);
  });
  // 一時停止;
  socket.on("pauseTime", (pauseTime) => {
    if (pauseTime.session) {
      socket.join(pauseTime.session);
    }
    // console.log("pauseTime", socket.rooms);
    io.to(pauseTime.session).emit("receivePauseTime");
  });
  socket.on("sendVideoId", (id) => {
    io.to(id.session).emit("receiveVideoId", id.id);
  });
  socket.on("disconnecting", () => {
    // for (room of )
    // console.log(io.of("/").adapter.rooms);
  });
});
let arrayInObj = {
  key1: [1, 2, 3],
  key2: [4, 5, 6],
};

console.log(arrayInObj.key1[2]);
console.log(arrayInObj["key2"][0]);
