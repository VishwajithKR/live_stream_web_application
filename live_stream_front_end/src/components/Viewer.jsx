// src/components/Viewer.js
import { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Viewer() {
  const videoRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    // When broadcaster sends media
    peer.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
      console.log("✅ Stream received");
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) socket.emit("candidate", event.candidate);
    };

    // When broadcaster sends an offer
    socket.on("offer", async (offer) => {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("candidate", (candidate) => {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    });
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-2">Viewer</h1>
      <video ref={videoRef} autoPlay playsInline className="w-2/3 rounded-lg" />
    </div>
  );
}
