const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById("js-local-stream");
  const joinTrigger = document.getElementById("js-join-trigger");
  const leaveTrigger = document.getElementById("js-leave-trigger");
  const remoteVideos = document.getElementById("js-remote-streams");
  const roomId = document.getElementById("js-room-id");
  const messages = document.getElementById("js-messages");
  const mikeOn = document.getElementById("mikeOn");
  const mikeOff = document.getElementById("mikeOff");
  const offVideo = document.getElementById("offVideo");
  const onVideo = document.getElementById("onVideo");

  const getRoomModeByHash = () => (location.hash === "#sfu" ? "sfu" : "mesh");

  // await navigator.mediaDevices.getUserMedia({ video: true });
  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .catch(console.error);

  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  const peer = (window.peer = new Peer({
    key: "89562d5b-065c-4dcb-834c-7a8ddf52333a",
    debug: 3,
  }));
  let obj = {
    a: 1,
    b: 2,
  };
  // ビデオon・off
  offVideo.addEventListener("click", () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = false;
      offVideo.setAttribute("class", "hidden");
      onVideo.setAttribute(
        "class",
        "w-12 fa-2x fa-solid fa-video-slash text-white cursor-pointer"
      );
    }
  });
  onVideo.addEventListener("click", () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = true;
      onVideo.setAttribute("class", "hidden");
      offVideo.setAttribute(
        "class",
        "w-12 fa-2x fa-solid fa-video text-white cursor-pointer"
      );
    }
  });
  // マイクon・off
  mikeOff.addEventListener("click", () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = false;
      mikeOff.setAttribute("class", "hidden");
      mikeOn.setAttribute(
        "class",
        "w-12 fa-2x fa-solid fa-microphone-slash text-white cursor-pointer"
      );
    }
  });
  mikeOn.addEventListener("click", () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = true;
      mikeOn.setAttribute("class", "hidden");
      mikeOff.setAttribute(
        "class",
        "w-12 fa-2x fa-solid fa-microphone text-white cursor-pointer"
      );
    }
  });

  joinTrigger.addEventListener("click", () => {
    joinTrigger.setAttribute("class", "hidden");
    leaveTrigger.setAttribute(
      "class",
      "btn btn-warning text-xs no-animation rounded-sm"
    );
    if (!peer.open) {
      return;
    }
    console.log("test");
    let sessionRoomName = getParam("sessionID");
    if (!sessionRoomName) {
      sessionRoomName = sessionID;
    }
    const room = peer.joinRoom(sessionRoomName, {
      mode: getRoomModeByHash(),
      stream: localStream,
    });

    room.once("open", () => {
      const ul = document.getElementById("messageList");
      const li = document.createElement("li");
      const text = document.createTextNode("ビデオ通話に参加しました");
      li.appendChild(text);
      ul.appendChild(li);
    });
    room.on("peerJoin", (peerId) => {
      const ul = document.getElementById("messageList");
      const li = document.createElement("li");
      const text = document.createTextNode(` ${peerId}さんが参加しました\n`);
      li.appendChild(text);
      ul.appendChild(li);
    });

    room.on("stream", async (stream) => {
      const newVideo = document.createElement("video");
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      newVideo.setAttribute("data-peer-id", stream.peerId);
      newVideo.setAttribute("style", "transform: scale(-1, 1)");
      remoteVideos.append(newVideo);
      await newVideo.play().catch(console.error);
    });

    room.on("data", ({ data, src }) => {
      messages.textContent += `${src}: ${data}\n`;
    });

    room.on("peerLeave", (peerId) => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id="${peerId}"]`
      );
      remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();
      const ul = document.getElementById("messageList");
      const li = document.createElement("li");
      const text = document.createTextNode(`${peerId}さんが離席しました\n`);
      li.appendChild(text);
      ul.appendChild(li);
    });

    room.once("close", () => {
      const ul = document.getElementById("messageList");
      const li = document.createElement("li");
      const text = document.createTextNode("ビデオ通話から離席しました");
      li.appendChild(text);
      ul.appendChild(li);
      Array.from(remoteVideos.children).forEach((remoteVideo) => {
        remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });

    leaveTrigger.addEventListener(
      "click",
      () => {
        leaveTrigger.setAttribute("class", "hidden");
        joinTrigger.setAttribute(
          "class",
          "btn btn-success text-xs no-animation rounded-sm"
        );
        room.close();
      },
      { once: true }
    );
  });

  peer.on("error", console.error);
})();
