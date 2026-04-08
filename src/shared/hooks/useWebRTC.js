import { useRef, useState, useCallback, useEffect } from "react";

// Constant — defined outside the hook to avoid a new object reference on
// every render (prevents unnecessary re-creation of createPeerConnection).
const RTC_CONFIGURATION = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const useWebRTC = (
  roomId,
  { onSignal, onStream, onPeerDisconnected, onNegotiationNeeded },
) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const videoToggleInFlight = useRef(false);
  const screenToggleInFlight = useRef(false);
  const screenStreamRef = useRef(null);
  const cameraTrackBeforeShareRef = useRef(null);
  const lastVideoEnabledBeforeShare = useRef(true);
  // Guard against concurrent/double offer creation
  const negotiatingRef = useRef(false);
  const negotiationQueuedRef = useRef(false);
  const pendingCandidatesRef = useRef([]);
  const remoteStreamRef = useRef(null);
  const remoteSubscriptionCleanupRef = useRef(null);
  const remoteTrackCleanupMapRef = useRef(new Map());

  const clearRemoteTrackSubscriptions = useCallback(() => {
    remoteTrackCleanupMapRef.current.forEach((cleanup) => cleanup());
    remoteTrackCleanupMapRef.current.clear();
  }, []);

  const syncRemoteStreamState = useCallback(() => {
    const stream = remoteStreamRef.current;
    if (!stream) {
      setRemoteStream(null);
      onStream?.(null);
      return;
    }

    const activeTracks = stream
      .getTracks()
      .filter((track) => track.readyState !== "ended");

    if (activeTracks.length === 0) {
      setRemoteStream(null);
      onStream?.(null);
      return;
    }

    // Keep the original MediaStream object stable so video elements don't
    // continuously receive a brand-new srcObject during track state changes.
    setRemoteStream(stream);
    onStream?.(stream);
  }, [onStream]);

  const watchRemoteTrack = useCallback(
    (track) => {
      if (!track || remoteTrackCleanupMapRef.current.has(track.id)) return;

      const onTrackStateChange = () => {
        syncRemoteStreamState();
      };

      track.addEventListener("ended", onTrackStateChange);
      track.addEventListener("mute", onTrackStateChange);
      track.addEventListener("unmute", onTrackStateChange);

      remoteTrackCleanupMapRef.current.set(track.id, () => {
        track.removeEventListener("ended", onTrackStateChange);
        track.removeEventListener("mute", onTrackStateChange);
        track.removeEventListener("unmute", onTrackStateChange);
      });
    },
    [syncRemoteStreamState],
  );

  const bindRemoteStream = useCallback(
    (stream) => {
      if (!stream) return;

      if (remoteSubscriptionCleanupRef.current) {
        remoteSubscriptionCleanupRef.current();
        remoteSubscriptionCleanupRef.current = null;
      }

      clearRemoteTrackSubscriptions();
      remoteStreamRef.current = stream;

      stream.getTracks().forEach((track) => watchRemoteTrack(track));

      const onAddTrack = (event) => {
        if (event?.track) {
          watchRemoteTrack(event.track);
        }
        syncRemoteStreamState();
      };

      const onRemoveTrack = (event) => {
        const removedTrackId = event?.track?.id;
        if (removedTrackId) {
          const cleanup = remoteTrackCleanupMapRef.current.get(removedTrackId);
          cleanup?.();
          remoteTrackCleanupMapRef.current.delete(removedTrackId);
        }
        syncRemoteStreamState();
      };

      stream.addEventListener("addtrack", onAddTrack);
      stream.addEventListener("removetrack", onRemoveTrack);

      remoteSubscriptionCleanupRef.current = () => {
        stream.removeEventListener("addtrack", onAddTrack);
        stream.removeEventListener("removetrack", onRemoveTrack);
        clearRemoteTrackSubscriptions();
      };

      syncRemoteStreamState();
    },
    [clearRemoteTrackSubscriptions, syncRemoteStreamState, watchRemoteTrack],
  );

  const requestRenegotiation = useCallback(() => {
    const pc = peerConnection.current;
    if (!pc) return;

    if (negotiatingRef.current || pc.signalingState !== "stable") {
      negotiationQueuedRef.current = true;
      return;
    }

    onNegotiationNeeded?.();
  }, [onNegotiationNeeded]);

  const ensureLocalTracksAttached = useCallback((pc) => {
    const stream = localStreamRef.current;
    if (!pc || !stream) return;

    const senders = pc.getSenders();
    stream.getTracks().forEach((track) => {
      const existingSender = senders.find(
        (sender) =>
          sender.track?.id === track.id || sender.track?.kind === track.kind,
      );

      if (existingSender) {
        if (existingSender.track?.id !== track.id) {
          existingSender.replaceTrack(track);
        }
      } else {
        pc.addTrack(track, stream);
      }
    });
  }, []);

  const flushQueuedRenegotiation = useCallback(() => {
    const pc = peerConnection.current;
    if (!pc) return;

    if (
      negotiationQueuedRef.current &&
      !negotiatingRef.current &&
      pc.signalingState === "stable"
    ) {
      negotiationQueuedRef.current = false;
      onNegotiationNeeded?.();
    }
  }, [onNegotiationNeeded]);

  const createPeerConnection = useCallback(() => {
    if (peerConnection.current) return peerConnection.current;

    const pc = new RTCPeerConnection(RTC_CONFIGURATION);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[WebRTC] ICE local candidate generated");
        onSignal({ type: "ICE", data: { candidate: event.candidate } });
      }
    };

    pc.ontrack = (event) => {
      console.log(
        "[WebRTC] ontrack — kind:",
        event.track?.kind,
        "streams:",
        event.streams?.length,
        "readyState:",
        event.track?.readyState,
      );
      if (event.streams && event.streams.length > 0) {
        bindRemoteStream(event.streams[0]);
      } else if (event.track) {
        const fallbackStream = remoteStreamRef.current || new MediaStream();
        if (!remoteStreamRef.current) {
          bindRemoteStream(fallbackStream);
        }

        const hasTrack = fallbackStream
          .getTracks()
          .some((track) => track.id === event.track.id);

        if (!hasTrack) {
          fallbackStream.addTrack(event.track);
          watchRemoteTrack(event.track);
          syncRemoteStreamState();
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("PC Connection State:", pc.connectionState);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        onPeerDisconnected?.();
      }
    };

    // Renegotiation: fires when addTrack/removeTrack changes the local
    // description requirements on an already-established connection
    // (e.g. pharmacist adds video after audio-only start, or toggles camera).
    pc.onnegotiationneeded = () => {
      console.log(
        "[WebRTC] onnegotiationneeded — signalingState:",
        pc.signalingState,
        "negotiating:",
        negotiatingRef.current,
      );
      requestRenegotiation();
    };

    if (localStreamRef.current) {
      ensureLocalTracksAttached(pc);
    }

    peerConnection.current = pc;
    return pc;
  }, [
    bindRemoteStream,
    ensureLocalTracksAttached,
    onSignal,
    onPeerDisconnected,
    requestRenegotiation,
    syncRemoteStreamState,
    watchRemoteTrack,
  ]);

  const startLocalStream = useCallback(
    async (constraints = { video: true, audio: true }) => {
      try {
        createPeerConnection();
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        localStreamRef.current = stream;

        const pc = peerConnection.current;
        if (pc) {
          ensureLocalTracksAttached(pc);
        }

        const hasAudio = stream.getAudioTracks().length > 0;
        const hasVideo = stream.getVideoTracks().length > 0;
        setIsAudioEnabled(
          hasAudio && stream.getAudioTracks()[0]?.enabled !== false,
        );
        setIsVideoEnabled(
          hasVideo && stream.getVideoTracks()[0]?.enabled !== false,
        );
        console.log(
          "[WebRTC] Local stream started — tracks:",
          stream.getTracks().map((track) => ({
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState,
            id: track.id,
          })),
        );
        return stream;
      } catch (error) {
        console.error("Error accessing media devices:", error);
        throw error;
      }
    },
    [createPeerConnection, ensureLocalTracksAttached],
  );

  const removeVideoTracks = useCallback(async () => {
    if (!localStreamRef.current) {
      setIsVideoEnabled(false);
      return;
    }

    // Stop camera tracks so the webcam device is actually released.
    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach((track) => {
      try {
        track.stop();
      } catch (error) {
        console.warn("[WebRTC] Failed to stop video track:", error);
      }
      localStreamRef.current.removeTrack(track);
    });

    const audioTracks = localStreamRef.current.getAudioTracks();
    const nextStream = new MediaStream(audioTracks);
    localStreamRef.current = nextStream;
    setLocalStream(nextStream);

    const pc = peerConnection.current;
    if (pc) {
      const videoSender = pc
        .getTransceivers()
        .find(
          (transceiver) => transceiver.receiver.track?.kind === "video",
        )?.sender;
      if (videoSender) {
        await videoSender.replaceTrack(null);
      }
    }

    setIsVideoEnabled(false);
    console.log("[WebRTC] Camera OFF — webcam released");
  }, []);

  const addVideoTrack = useCallback(async () => {
    const videoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    const videoTrack = videoStream.getVideoTracks()[0];
    if (!videoTrack) return;

    if (!localStreamRef.current) {
      const newStream = new MediaStream([videoTrack]);
      localStreamRef.current = newStream;
      setLocalStream(newStream);
    } else {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.stop();
        localStreamRef.current.removeTrack(track);
      });
      localStreamRef.current.addTrack(videoTrack);
      setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
    }

    const pc = peerConnection.current;
    if (pc) {
      // Use getTransceivers() so we find the video transceiver even when its
      // sender track is currently null from previous camera/screen transitions.
      const videoTransceiver = pc
        .getTransceivers()
        .find((t) => t.receiver.track?.kind === "video");
      if (videoTransceiver) {
        await videoTransceiver.sender.replaceTrack(videoTrack);
      } else {
        // First time adding video to an audio-only connection:
        // addTrack triggers onnegotiationneeded → renegotiation handled above.
        pc.addTrack(videoTrack, localStreamRef.current);
      }
    }

    setIsVideoEnabled(true);
    console.log("[WebRTC] Camera ON — fresh webcam track acquired");
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (!isScreenSharing || screenToggleInFlight.current) return;
    screenToggleInFlight.current = true;

    try {
      if (screenStreamRef.current) {
        console.log("[WebRTC] Stopping screen share tracks");
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      setIsScreenSharing(false);

      const pc = peerConnection.current;
      const videoSender = pc
        ?.getTransceivers()
        .find(
          (transceiver) => transceiver.receiver.track?.kind === "video",
        )?.sender;

      if (lastVideoEnabledBeforeShare.current) {
        const restoredCamera = cameraTrackBeforeShareRef.current;
        if (restoredCamera && restoredCamera.readyState !== "ended") {
          if (videoSender) {
            await videoSender.replaceTrack(restoredCamera);
          }
          const audioTracks = localStreamRef.current
            ? localStreamRef.current.getAudioTracks()
            : [];
          const restoredStream = new MediaStream([
            ...audioTracks,
            restoredCamera,
          ]);
          localStreamRef.current = restoredStream;
          setLocalStream(restoredStream);
          setIsVideoEnabled(restoredCamera.enabled !== false);
        } else {
          await addVideoTrack();
        }
      } else {
        if (videoSender) {
          await videoSender.replaceTrack(null);
        }
        setIsVideoEnabled(false);
        if (localStreamRef.current) {
          const audioTracks = localStreamRef.current.getAudioTracks();
          localStreamRef.current = new MediaStream(audioTracks);
          setLocalStream(localStreamRef.current);
        }
      }
      cameraTrackBeforeShareRef.current = null;
    } catch (error) {
      console.error("Failed to stop screen share:", error);
    } finally {
      screenToggleInFlight.current = false;
    }
  }, [addVideoTrack, isScreenSharing]);

  const startScreenShare = useCallback(async () => {
    if (isScreenSharing || screenToggleInFlight.current) return;
    screenToggleInFlight.current = true;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) return;

      screenStreamRef.current = screenStream;
      lastVideoEnabledBeforeShare.current = isVideoEnabled;
      cameraTrackBeforeShareRef.current =
        localStreamRef.current?.getVideoTracks?.()[0] || null;

      const audioTracks = localStreamRef.current
        ? localStreamRef.current.getAudioTracks()
        : [];
      const composedStream = new MediaStream([...audioTracks, screenTrack]);
      localStreamRef.current = composedStream;
      setLocalStream(composedStream);

      const pc = peerConnection.current;
      if (pc) {
        // Same fix: find video transceiver even with null sender track.
        const videoTransceiver = pc
          .getTransceivers()
          .find((t) => t.receiver.track?.kind === "video");
        if (videoTransceiver) {
          videoTransceiver.sender.replaceTrack(screenTrack);
        } else {
          pc.addTrack(screenTrack, composedStream);
        }
      }

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setIsVideoEnabled(true);
      setIsScreenSharing(true);
      console.log("[WebRTC] Screen share started");
    } catch (error) {
      console.error("Failed to start screen share:", error);
    } finally {
      screenToggleInFlight.current = false;
    }
  }, [isScreenSharing, isVideoEnabled, stopScreenShare]);

  const toggleScreenShare = useCallback(async () => {
    if (screenToggleInFlight.current) return;
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  const createOffer = useCallback(async () => {
    const pc = createPeerConnection();
    ensureLocalTracksAttached(pc);

    // Guard: avoid overlapping offers; queue renegotiation when one is in flight.
    if (negotiatingRef.current || pc.signalingState !== "stable") {
      negotiationQueuedRef.current = true;
      console.log(
        "[WebRTC] createOffer deferred — signalingState:",
        pc.signalingState,
        "negotiating:",
        negotiatingRef.current,
      );
      return;
    }

    negotiatingRef.current = true;
    console.log(
      "[WebRTC] createOffer — localTracks:",
      localStreamRef.current?.getTracks().map((t) => t.kind),
    );
    console.log(
      "[WebRTC] createOffer — senders:",
      pc.getSenders().map((sender) => ({
        kind: sender.track?.kind || "none",
        readyState: sender.track?.readyState || "none",
      })),
    );
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("[WebRTC] OFFER created, sending via STOMP");
      onSignal({ type: "OFFER", data: { sdp: offer } });
    } finally {
      negotiatingRef.current = false;
      flushQueuedRenegotiation();
    }
  }, [
    createPeerConnection,
    ensureLocalTracksAttached,
    flushQueuedRenegotiation,
    onSignal,
  ]);

  const handleSignal = useCallback(
    async (signal) => {
      const { type, data } = signal;

      try {
        switch (type) {
          case "OFFER": {
            console.log(
              "[WebRTC] handleSignal OFFER, signalingState:",
              createPeerConnection().signalingState,
            );
            const pc = createPeerConnection();
            if (pc.signalingState !== "stable") {
              if (pc.signalingState === "have-local-offer") {
                await pc.setLocalDescription({ type: "rollback" });
              } else {
                console.warn("Ignoring OFFER in state:", pc.signalingState);
                return;
              }
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            ensureLocalTracksAttached(pc);
            for (const c of pendingCandidatesRef.current) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              } catch (e) {
                console.warn("Buffered ICE flush error:", e);
              }
            }
            pendingCandidatesRef.current = [];
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            onSignal({ type: "ANSWER", data: { sdp: answer } });
            flushQueuedRenegotiation();
            break;
          }
          case "ANSWER": {
            console.log(
              "[WebRTC] handleSignal ANSWER, signalingState:",
              peerConnection.current?.signalingState,
            );
            const pc = peerConnection.current;
            if (!pc || pc.signalingState !== "have-local-offer") {
              console.warn("Ignoring ANSWER in state:", pc?.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            for (const c of pendingCandidatesRef.current) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
              } catch (e) {
                console.warn("Buffered ICE flush error:", e);
              }
            }
            pendingCandidatesRef.current = [];
            flushQueuedRenegotiation();
            break;
          }
          case "ICE": {
            if (!data?.candidate) break;
            const pc = peerConnection.current;
            if (pc?.remoteDescription) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log("[WebRTC] ICE candidate applied immediately");
              } catch (e) {
                console.warn("Failed to add ICE candidate:", e);
              }
            } else {
              pendingCandidatesRef.current.push(data.candidate);
              console.log(
                "[WebRTC] ICE candidate buffered — pending:",
                pendingCandidatesRef.current.length,
              );
            }
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error("handleSignal error:", type, err);
      }
    },
    [
      createPeerConnection,
      ensureLocalTracksAttached,
      flushQueuedRenegotiation,
      onSignal,
    ],
  );

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsAudioEnabled(track.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (videoToggleInFlight.current) return;
    videoToggleInFlight.current = true;

    try {
      if (screenToggleInFlight.current) return;
      if (isScreenSharing) {
        await stopScreenShare();
        return;
      }

      if (!localStreamRef.current) {
        await startLocalStream({ video: true, audio: true });
        return;
      }

      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        if (track.readyState === "ended") {
          await addVideoTrack();
          return;
        }

        await removeVideoTracks();
        return;
      }

      await addVideoTrack();
    } catch (error) {
      console.error("Failed to toggle video:", error);
    } finally {
      videoToggleInFlight.current = false;
    }
  }, [
    addVideoTrack,
    isScreenSharing,
    removeVideoTracks,
    startLocalStream,
    stopScreenShare,
  ]);

  const closeConnection = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    pendingCandidatesRef.current = [];
    negotiationQueuedRef.current = false;
    if (remoteSubscriptionCleanupRef.current) {
      remoteSubscriptionCleanupRef.current();
      remoteSubscriptionCleanupRef.current = null;
    }
    remoteStreamRef.current = null;
    setRemoteStream(null);
  }, []);

  const resetPeerConnection = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    pendingCandidatesRef.current = [];
    negotiatingRef.current = false;
    negotiationQueuedRef.current = false;
    if (remoteSubscriptionCleanupRef.current) {
      remoteSubscriptionCleanupRef.current();
      remoteSubscriptionCleanupRef.current = null;
    }
    remoteStreamRef.current = null;
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    return () => closeConnection();
  }, [closeConnection]);

  return {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    startLocalStream,
    createOffer,
    handleSignal,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    startScreenShare,
    stopScreenShare,
    closeConnection,
    resetPeerConnection,
  };
};

export default useWebRTC;
