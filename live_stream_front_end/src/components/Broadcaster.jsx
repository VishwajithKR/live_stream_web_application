// src/components/Broadcaster.js
import { useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Broadcaster() {
  const videoRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    const start = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;

      const peer = new RTCPeerConnection();
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
      peerRef.current = peer;

      peer.onicecandidate = (event) => {
        if (event.candidate) socket.emit("candidate", event.candidate);
      };

      // Create and send offer
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("offer", offer);

      // ✅ Listen for answer from viewer
      socket.on("answer", async (answer) => {
        if (!peer.currentRemoteDescription) {
          await peer.setRemoteDescription(answer);
          console.log("✅ Remote description set (Viewer connected)");
        }
      });

      socket.on("candidate", (candidate) => {
        peer.addIceCandidate(new RTCIceCandidate(candidate));
      });
    };

    start();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl font-bold mb-2">Broadcaster</h1>
      <video ref={videoRef} autoPlay muted className="w-2/3 rounded-lg" />
    </div>
  );
}
