// rootのみでhowToモーダル出すように
// const myModal4 = document.getElementById("my-modal4");
// myModal4.checked = true;
// let homeUrl = new URL(window.location.href);
// if (homeUrl != "http://localhost:3000/") {
//   myModal4.setAttribute("class", "hidden");
// }
// 準備完了モーダルをdefaultで出す
let playTimeSum;
document.getElementById("my-modal").checked = true;
const shareUrl = document.getElementById("shareUrl");
// if (getParam("master")) {
//   let url = new URL(window.location.href);
//   url.searchParams.delete("master");
//   /url = new URL(window.location.href);
//   console.log(url.href);
//   shareUrl.innerHTML = url.href;
// let sessionId = getParam("sessionID");
// console.log(sessionId);
// socket.emit("joinRoom", sessionId);
// }
// ページきた瞬間sessionID発行
let sessionID = "";
let randNum = "";
let isMaster = true;
// sessionID取得
if (getParam("sessionID")) {
  sessionID = getParam("sessionID");
  axios
    .get("http://localhost:3000/get-role", {
      params: { masterSession: sessionID },
    })
    .then(function (response) {
      console.log(response.data.isMaster);
      isMaster = response.data.isMaster;
      if (!isMaster || !getParam("videoid")) {
        createShareUrl.setAttribute("class", "hidden");
      } //通信OK
      if (!isMaster) {
        readyModal.setAttribute("class", "modal");
        navBar.setAttribute("class", "hidden");
        playTimeRange.setAttribute("disabled", true);
        playTimeRange.setAttribute("class", "range w-2/3 cursor-not-allowed");
      }
    })
    .catch(function (error) {
      console.log(error); //通信Error
    });
}
const videoIdParamsBtn = document.getElementById("videoIdParamsBtn");

// youtubeURLを成型して埋め込み動画のID変える
videoIdParamsBtn.addEventListener("click", () => {
  axios
    .get("http://localhost:3000/create-session")
    .then(function (response) {
      console.log(response.data.sessionID);
      sessionID = response.data.sessionID;
    })
    .catch(function (error) {
      console.log(error); //通信Error
    });
  const urlId = document.getElementById("videoIdParams").value;
  const regex = /\?v=([^&]+)/;
  const idArray = urlId.match(regex);
  const id = idArray[1];
  let url = new URL(window.location.href);
  url.searchParams.delete("retry");
  url.searchParams.set("videoid", id);
  let sessionURL;
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("sendVideoId", {
      id: id,
      session: sessionURL,
    });
  } else {
    socket.emit("sendVideoId", {
      id: id,
      session: sessionID,
    });
  }

  location.href = url.href;
});
// エンター押されたらyoutubeURL送信
function sendVideoId(code) {
  //エンターキー押下なら
  if (13 === code) {
    axios
      .get("http://localhost:3000/create-session")
      .then(function (response) {
        console.log(response.data.sessionID);
        sessionID = response.data.sessionID;
      })
      .catch(function (error) {
        console.log(error); //通信Error
      });
    const urlId = document.getElementById("videoIdParams").value;
    const regex = /\?v=([^&]+)/;
    const idArray = urlId.match(regex);
    const id = idArray[1];
    let url = new URL(window.location.href);
    url.searchParams.delete("retry");
    url.searchParams.set("videoid", id);
    let sessionURL;
    if (getParam("sessionID")) {
      sessionURL = getParam("sessionID");
      socket.emit("sendVideoId", {
        id: id,
        session: sessionURL,
      });
    } else {
      socket.emit("sendVideoId", {
        id: id,
        session: sessionID,
      });
    }

    location.href = url.href;
  }
}

// 共有URL発行するDOM
const createShareUrl = document.getElementById("createShareUrl");

// 共有URL発行ボタンを親側でyoutubeURL送信した後の状態のみ表示するように
// または子側の場合は表示しない
// console.log("hoge", isMaster);
if (!getParam("videoid")) {
  createShareUrl.setAttribute("class", "hidden");
}

// 共有URL発行イベント
createShareUrl.addEventListener("click", () => {
  // randNum = Math.floor(Math.random() * 100000).toString();

  axios
    .get("http://localhost:3000/create-session")
    .then(function (response) {
      console.log(response.data.sessionID);
      sessionID = response.data.sessionID;

      const url = new URL(window.location);
      url.searchParams.set("sessionID", sessionID);
      history.pushState({}, "", url);
      // url.searchParams.set("master", true);
      // url.searchParams.delete("master");
      //   console.log(url.href);
      shareUrl.innerHTML = url.href;
      socket.emit("joinRoom", sessionID); //通信OK
    })
    .catch(function (error) {
      console.log(error); //通信Error
    });

  // location.href = url.href;
});
let videoId = getParam("videoid"); //「jquery」を出力
// console.log(getParam("videoid"));
/**
 * Get the URL parameter value
 *
 * @param  name {string} パラメータのキー文字列
 * @return  url {url} 対象のURL文字列（任意）
 */
// console.log(getParam("sessionID"));
// function getParam(name, url) {
//   if (!url) url = window.location.href;
//   name = name.replace(/[\[\]]/g, "\\$&");
//   var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
//     results = regex.exec(url);
//   if (!results) return null;
//   if (!results[2]) return "";
//   return decodeURIComponent(results[2].replace(/\+/g, " "));
// }
const socket = io();

const clearText = () => {
  document.getElementById("inputText").value = "";
};

const addMessageList = (message) => {
  const chat = document.getElementById("chat");
  const ul = document.getElementById("messageList");
  const li = document.createElement("li");
  const text = document.createTextNode(message.message);
  const name = document.createTextNode(message.userName + " : ");
  li.appendChild(name);
  li.appendChild(text);
  ul.appendChild(li);
  chat.scrollTo(0, ul.scrollHeight);
};

document.getElementById("sendButton").addEventListener("click", () => {
  let inputMessage = document.getElementById("inputText").value;
  const userName = localStorage.getItem("name");
  // let inputMessage = { a: [1, 2, 3], b: "22" };
  if (inputMessage === "") {
    return;
  }
  let sessionURL;
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("sendMessage", {
      message: inputMessage,
      session: sessionURL,
      userName: userName,
    });
  } else {
    socket.emit("sendMessage", {
      message: inputMessage,
      session: sessionID,
      userName: userName,
    });
  }
  clearText();
  // let url = new URL(window.location.href);
  // url.searchParams.set("sessionID", sessionID);
  // console.log(url.href);
});
// EnterKey押した時にメッセージ送信されるように
function sendMessageByEnterKey(code) {
  //エンターキー押下なら
  if (13 === code) {
    let inputMessage = document.getElementById("inputText").value;
    const userName = localStorage.getItem("name");
    // let inputMessage = { a: [1, 2, 3], b: "22" };
    if (inputMessage === "") {
      return;
    }
    let sessionURL;
    if (getParam("sessionID")) {
      sessionURL = getParam("sessionID");
      socket.emit("sendMessage", {
        message: inputMessage,
        session: sessionURL,
        userName: userName,
      });
    } else {
      socket.emit("sendMessage", {
        message: inputMessage,
        session: sessionID,
        userName: userName,
      });
    }
    clearText();
  }
}

//  'receiveMessage' イベントの発火を検知
//  第一引数には受信したメッセージが入る
socket.on("receiveMessage", (message) => {
  // 受信したメッセージをulタグに挿入
  addMessageList(message);
  console.log(message.userName);
  const chat = document.getElementById("chat");
});

//iframe player api!
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player; // 変数playerを用意
// APIが読み込まれて準備が整ったら実行される関数

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    // YT.Playerオブジェクトを作成（'player'は動画の挿入先のid名）
    videoId: videoId,
    playerVars: {
      // 'autoplay': 1,
      // 'mute': 1,
      controls: 0,
      loop: 1,
      // showinfo: 0,
      playlist: videoId,
      //'rel': 0
    },
    events: {
      onError: function () {
        let url = new URL(window.location.href);
        let retryCount = 1;
        if (url.searchParams.get("retry")) {
          retryCount = Number(getParam("retry")) + 1;
          url.searchParams.delete("retry");
        }
        // url.searchParams.append("retry", retryCount);
        url.searchParams.set("retry", retryCount);
        if (retryCount < 3) {
          console.log(url.href);
          location.href = url.href;
        }
      },
    },
  });
}

const stopButton = document.getElementById("stopMovie");
const pauseButton = document.getElementById("pauseMovie");
const playButton = document.getElementById("playMovie");
const nextButton = document.getElementById("next");
const prevButton = document.getElementById("prev");
const startAndStop = document.getElementById("startAndStop");
const mute = document.getElementById("mute");
const volumeOn = document.getElementById("volumeOn");
const navBar = document.getElementById("navBar");
const readyModal = document.getElementById("readyModal");
const volumeRange = document.getElementById("volumeRange");
const playTimeRange = document.getElementById("playTimeRange");
const videoTime = document.getElementById("videoTime");
const currentVideoTime = document.getElementById("currentVideoTime");
let minute;
let seconds;

// 再生時間シークバーを移動させたらシークバーのmaxのvalueに総再生時間入れて、指定の再生時間まで動かす
playTimeRange.addEventListener("change", () => {
  // if (player.getPlayerState() == -1) {
  //   player.pauseVideo();
  // }
  if (!playTimeSum || playTimeRange.value == 0) {
    let playTimeSum = player.getDuration();
    playTimeRange.setAttribute("max", playTimeSum);
  }

  player.seekTo(playTimeRange.value);
  let sessionURL;
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("sendTimeBySeekBar", {
      time: playTimeRange.value,
      session: sessionURL,
    });
  } else {
    socket.emit("sendTimeBySeekBar", {
      time: playTimeRange.value,
      session: sessionID,
    });
  }
  if (player.getPlayerState() == 1) {
    pauseButton.setAttribute(
      "class",
      "w-5 fa-2x fa-solid fa-pause text-white cursor-pointer"
    );
    playButton.setAttribute("class", "hidden");
  }
});
// 総再生時間を表示
setTimeout("changeToPerMinute()", 1000);
// 現在の再生位置を表示
setInterval("rewriteCurrentTime()", 1000);
// 定期的にシークバー移動イベントを実施
setInterval("playTimeRange.value = player.getCurrentTime()", 1000);

function moveSeekBar() {
  playTimeRange.value = String(100);
}

// 現在の再生位置を取得して書き換え
function rewriteCurrentTime() {
  let timeArray = [];

  if (player.getCurrentTime() >= 3600) {
    timeArray[0] = Math.floor(player.getCurrentTime() / 3600);
    const modSeconds = Math.floor(player.getCurrentTime() % 3600);
    timeArray[1] = Math.floor(modSeconds / 60);
    timeArray[2] = Math.floor(modSeconds % 60);
  } else if (player.getCurrentTime() > 60) {
    timeArray[0] = Math.floor(player.getCurrentTime() / 60);
    timeArray[1] = Math.floor(player.getCurrentTime() % 60);
  } else {
    timeArray[0] = 0;
    timeArray[1] = Math.floor(player.getCurrentTime());
  }
  for (let i = 1; i < timeArray.length; i++) {
    timeArray[i] = ("00" + timeArray[i]).slice(-2);
  }
  const timeResult = timeArray.join(":");
  currentVideoTime.textContent = timeResult;
}
// 総再生時間を取得して分表示に書き換え
function changeToPerMinute() {
  // 総再生時間を表示
  let timeArray = [];
  if (player.getDuration() >= 3600) {
    timeArray[0] = Math.floor(player.getDuration() / 3600);
    const modSeconds = Math.floor(player.getDuration() % 3600);
    timeArray[1] = Math.floor(modSeconds / 60);
    timeArray[2] = Math.floor(modSeconds % 60);
  } else if (player.getDuration() > 60) {
    timeArray[0] = Math.floor(player.getDuration() / 60);
    timeArray[1] = Math.floor(player.getDuration() % 60);
  } else {
    timeArray[0] = 0;
    timeArray[1] = Math.floor(player.getDuration());
  }
  for (let i = 1; i < timeArray.length; i++) {
    timeArray[i] = ("00" + timeArray[i]).slice(-2);
  }
  const timeResult = timeArray.join(":");
  videoTime.textContent = timeResult;
}

startAndStop.addEventListener("click", () => {
  const userName = localStorage.getItem("name");
  player.playVideo();
  player.stopVideo();
  sessionURL = getParam("sessionID");
  socket.emit("sendMessage", {
    message: "準備完了しました",
    session: sessionURL,
    userName: userName,
  });
  player.setVolume(30);
  // const navBar = document.getElementById("navBar");
  // let url = new URL(window.location.href);
  // navBar.setAttribute(
  //   "class",
  //   "flex flex-row items-center justify-center space-x-5"
  // );
  // startAndStop.setAttribute("class", "hidden");
  // if (url.origin == "http://localhost:3000") {
  //   let videoId = "a_iQqN1Hp74";
  // }
});
// if (isMaster) {
//   readyModal.setAttribute("class", "hidden");
// }
stopButton.addEventListener("click", () => {
  playTimeRange.value = String(0);
  player.stopVideo();
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("stopVIdeo", {
      stop: "stopTime",
      session: sessionURL,
    });
  } else {
    socket.emit("stopVIdeo", {
      stop: "stopTime",
      session: sessionID,
    });
  }
  playButton.setAttribute(
    "class",
    "w-5 fa-2x fa-solid fa-play text-white cursor-pointer"
  );
  pauseButton.setAttribute("class", "hidden");
  if (!playTimeSum) {
    let playTimeSum = player.getDuration();
    playTimeRange.setAttribute("max", playTimeSum);
  }
});
pauseButton.addEventListener("click", () => {
  player.pauseVideo();
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("pauseTime", {
      pauseTime: "pauseTime",
      session: sessionURL,
    });
  } else {
    socket.emit("pauseTime", {
      pauseTime: "pauseTime",
      session: sessionID,
    });
  }
  playButton.setAttribute(
    "class",
    "w-5 fa-2x fa-solid fa-play text-white cursor-pointer"
  );
  pauseButton.setAttribute("class", "hidden");
});
playButton.addEventListener("click", () => {
  if (!playTimeSum) {
    let playTimeSum = player.getDuration();
    playTimeRange.setAttribute("max", playTimeSum);
  }
  player.playVideo();
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("playTime", {
      play: "playTime",
      session: sessionURL,
    });
  } else {
    socket.emit("playTime", {
      play: "playTime",
      session: sessionID,
    });
  }
  pauseButton.setAttribute(
    "class",
    "w-5 fa-2x fa-solid fa-pause text-white cursor-pointer"
  );
  playButton.setAttribute("class", "hidden");
});
nextButton.addEventListener("click", () => {
  if (!playTimeSum) {
    let playTimeSum = player.getDuration();
    playTimeRange.setAttribute("max", playTimeSum);
  }
  playTimeRange.value = Number(playTimeRange.value) + 60;
  const currentTime = player.getCurrentTime();
  // シークバーの移動
  player.seekTo(currentTime + 60);
  let sessionURL;
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("sendTime", {
      time: currentTime + 60,
      session: sessionURL,
    });
  } else {
    socket.emit("sendTime", {
      time: currentTime + 60,
      session: sessionID,
    });
  }
  // socket.emit("sendTime", currentTime + 60);
});
prevButton.addEventListener("click", () => {
  if (!playTimeSum) {
    let playTimeSum = player.getDuration();
    playTimeRange.setAttribute("max", playTimeSum);
  }
  playTimeRange.value = Number(playTimeRange.value) - 60;
  const currentTime = player.getCurrentTime();
  // シークバーの移動
  player.seekTo(currentTime - 60);
  let sessionURL;
  if (getParam("sessionID")) {
    sessionURL = getParam("sessionID");
    socket.emit("prevTime", {
      time: currentTime - 60,
      session: sessionURL,
    });
  } else {
    socket.emit("prevTime", {
      time: currentTime - 60,
      session: sessionID,
    });
  }
});
volumeRange.addEventListener("change", (event) => {
  if (player.isMuted()) {
    volumeOn.setAttribute(
      "class",
      "w-5 fa-2x fa-solid fa-solid fa-volume-high text-white cursor-pointer"
    );
    mute.setAttribute("class", "hidden");
  }
  if (volumeRange.value == 0) {
    mute.setAttribute(
      "class",
      "w-5 fa-2x fa-solid fa-volume-xmark text-white cursor-pointer"
    );
    volumeOn.setAttribute("class", "hidden");
  } else {
    volumeOn.setAttribute(
      "class",
      "w-5 fa-2x fa-solid fa-solid fa-volume-high text-white cursor-pointer"
    );
    mute.setAttribute("class", "hidden");
  }
  player.unMute();
  player.setVolume(volumeRange.value);
});
volumeOn.addEventListener("click", () => {
  player.mute();
  mute.setAttribute(
    "class",
    "w-5 fa-2x fa-solid fa-volume-xmark text-white cursor-pointer"
  );
  volumeOn.setAttribute("class", "hidden");
});
mute.addEventListener("click", () => {
  player.unMute();
  volumeOn.setAttribute(
    "class",
    "w-5 fa-2x fa-solid fa-solid fa-volume-high text-white cursor-pointer"
  );
  mute.setAttribute("class", "hidden");
});
socket.on("receiveTime", (time) => {
  player.seekTo(time);
});
socket.on("receiveTimeBySeekBar", (time) => {
  player.seekTo(time);
  if (!playTimeSum || playTimeRange.value == 0) {
    let playTimeSum = player.getDuration();
    playTimeRange.setAttribute("max", playTimeSum);
  }
  playTimeRange.value = time;
});
socket.on("receiveStopTime", () => {
  player.stopVideo();
});
socket.on("receivePlayTime", () => {
  player.playVideo();
});
socket.on("receivePrevTime", (time) => {
  player.seekTo(time);
});
socket.on("receivePauseTime", () => {
  player.pauseVideo();
});
socket.on("receiveVideoId", (id) => {
  let url = new URL(window.location.href);
  url.searchParams.delete("retry");
  url.searchParams.set("videoid", id);
  location.href = url.href;
  const navBar = document.getElementById("navBar");
  navBar.setAttribute(
    "class",
    "hidden flex-row items-center justify-center space-x-5"
  );
  startAndStop.setAttribute(
    "class",
    "py-2 px-4 py-2 px-4 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm"
  );
});
const copyIcon = document.getElementById("copyIcon");
copyIcon.addEventListener("click", () => {
  const shareUrl = document.getElementById("shareUrl");
  const copyTooltip = document.getElementById("copyTooltip");
  copyTooltip.setAttribute("data-tip", "Copied!");
  navigator.clipboard.writeText(shareUrl.textContent);
  //  コピー対象のテキストを選択する
  // shareUrl.select("Copy");
  //  選択しているテキストをクリップボードにコピーする
  // document.execCommand("Copy");
});
// モーダル閉じた時にtooltipsの文字戻す
const closeModalBtn = document.getElementById("closeModalBtn");
closeModalBtn.addEventListener("click", () => {
  const copyTooltip = document.getElementById("copyTooltip");
  copyTooltip.setAttribute("data-tip", "click Copy link!!");
});

// howToUseBtn押した時に名前をlocalStorageに保存
const submitNameBtn = document.getElementById("submitNameBtn");
submitNameBtn.addEventListener("click", () => {
  const userName = document.getElementById("nameInput").value;
  if (!userName) {
    alert("名前を入力してください");
  }
  localStorage.setItem("name", userName);
});

const confirmUserName = localStorage.getItem("name");
if (confirmUserName) {
  const nameInput = document.getElementById("nameInput");
  nameInput.value = confirmUserName;
} else {
  // player.playVideo();
  // player.stopVideo();
  // document.getElementById("my-modal").checked = false;
  const myModal4 = document.getElementById("my-modal4");
  myModal4.checked = true;
}
