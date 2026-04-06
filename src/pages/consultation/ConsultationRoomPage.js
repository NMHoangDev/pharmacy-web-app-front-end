import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import useWebRTC from "../../hooks/useWebRTC";
import { useStompSignaling } from "../../hooks/useStompSignaling";
import appointmentApi from "../../api/appointmentApi";
import TopBar from "../../components/consultation/TopBar";
import VideoStage from "../../components/consultation/VideoStage";
import ControlBar from "../../components/consultation/ControlBar";
import SidePanel from "../../components/consultation/SidePanel";

const ConsultationRoomPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { userId, roles } = useAppContext();
  const isAdmin = roles?.includes("ADMIN");
  const isPharmacistRole =
    roles?.includes("PHARMACIST") || roles?.includes("STAFF");
  const role = isPharmacistRole ? "PHARMACIST" : isAdmin ? "ADMIN" : "USER";
  const canWriteNotes = isPharmacistRole;

  const normalizeSessionType = useCallback((value) => {
    if (!value) return null;
    const raw = String(value).toUpperCase();
    if (raw.includes("VOICE")) return "VOICE";
    if (raw.includes("VIDEO")) return "VIDEO";
    return null;
  }, []);

  const [appointment, setAppointment] = useState({
    id: appointmentId,
    patientName: "Bệnh nhân",
    pharmacistName: "Dược sĩ",
  });
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const webrtcRef = useRef(null);
  const offerSentRef = useRef(false);
  const joinSentRef = useRef(false);
  const messageIdsRef = useRef([]);
  const appointmentRef = useRef(appointment);
  const [offerTrigger, setOfferTrigger] = useState(0);
  // Always-current role ref to avoid stale closure in STOMP callbacks
  const roleRef = useRef(role);
  const isPharmacistRoleRef = useRef(isPharmacistRole);
  roleRef.current = role;
  isPharmacistRoleRef.current = isPharmacistRole;
  appointmentRef.current = appointment;

  const resolvePatientName = useCallback(
    (data) =>
      data?.fullName ||
      data?.patientName ||
      data?.user?.fullName ||
      "Bệnh nhân",
    [],
  );

  const resolvePatientContact = useCallback(
    (data) => data?.contact || data?.user?.phone || "",
    [],
  );

  const normalizeChatMessage = useCallback(
    (payload) => {
      const senderId = String(payload?.senderId || "");
      const senderRole = String(payload?.senderRole || "").toUpperCase();
      const pharmacistIds = [
        appointmentRef.current?.pharmacistId,
        appointmentRef.current?.pharmacist?.id,
      ]
        .filter(Boolean)
        .map((id) => String(id));

      let isSelf = false;
      // Prefer role-based ownership because pharmacist WS actor id can differ
      // from JWT subject/user id, which makes pure senderId comparisons brittle.
      if (isPharmacistRoleRef.current) {
        isSelf = senderRole === "PHARMACIST";
      } else {
        isSelf = senderRole === "USER" || senderRole === "ADMIN";
      }

      // Fallback to senderId checks when role is missing/unknown.
      if (!senderRole) {
        isSelf = isPharmacistRoleRef.current
          ? pharmacistIds.includes(senderId) ||
            senderId === String(userId || "")
          : senderId === String(userId || "");
      }

      return {
        ...payload,
        isSelf,
        senderName:
          payload?.senderRole === "PHARMACIST"
            ? appointmentRef.current?.pharmacist?.fullName ||
              appointmentRef.current?.pharmacistName ||
              "Dược sĩ"
            : resolvePatientName(appointmentRef.current),
      };
    },
    [resolvePatientName, userId],
  );

  const isOwnSignalMessage = useCallback(
    (signalPayload) => {
      if (signalPayload?._isOwnClientSignal) return true;
      const from = String(signalPayload?.fromUserId || "");
      if (!from) return false;

      if (from === String(userId || "")) return true;

      if (!isPharmacistRoleRef.current) {
        return false;
      }

      const pharmacistIdCandidates = [
        appointmentRef.current?.pharmacistId,
        appointmentRef.current?.pharmacist?.id,
      ]
        .filter(Boolean)
        .map((id) => String(id));

      return pharmacistIdCandidates.includes(from);
    },
    [userId],
  );

  const trackMessageId = useCallback((messageId) => {
    if (!messageId) return;
    messageIdsRef.current = Array.from(
      new Set([...messageIdsRef.current, messageId]),
    );
  }, []);

  // Handle incoming STOMP messages
  const handleStompMessage = useCallback(
    (msg) => {
      const { type, payload } = msg;

      switch (type) {
        case "SIGNAL":
          // Ignore signals we sent ourselves (prevents echo/glare)
          if (!isOwnSignalMessage(payload)) {
            console.log(
              "[Room] SIGNAL received:",
              payload?.type,
              "from:",
              payload?.fromUserId,
            );
            // Pharmacist: when a peer sends JOIN, reset PC and send a fresh OFFER
            if (payload?.type === "JOIN" && isPharmacistRoleRef.current) {
              console.log(
                "[Room] JOIN received — resetting PC and re-offering",
              );
              webrtcRef.current?.resetPeerConnection();
              offerSentRef.current = false;
              setOfferTrigger((n) => n + 1);
            } else {
              webrtcRef.current?.handleSignal(payload);
            }
          } else {
            console.log(
              "[Room] SIGNAL echo filtered (own message):",
              payload?.type,
            );
          }
          break;
        case "CHAT":
          console.log(
            "[Room] CHAT received:",
            payload?.id,
            "role:",
            payload?.senderRole,
            "from:",
            payload?.senderId,
          );
          trackMessageId(payload?.id);
          setMessages((prev) => {
            if (payload?.id && prev.some((item) => item.id === payload.id)) {
              return prev;
            }
            return [...prev, normalizeChatMessage(payload)];
          });
          break;
        case "SESSION":
          console.log("Session event:", payload.event);
          if (payload.status) {
            setSession((prev) => ({
              ...prev,
              status: payload.status,
              participants: payload.participants,
            }));
          }
          if (payload.event === "ENDED" || payload.status === "ENDED") {
            setMessages([]);
            messageIdsRef.current = [];
          }
          break;
        default:
          break;
      }
    },
    [isOwnSignalMessage, normalizeChatMessage, trackMessageId],
  );

  // Initialize Hooks
  const stomp = useStompSignaling(
    appointmentId,
    session?.roomId,
    handleStompMessage,
  );

  // Keep a ref so the renegotiation callback can read connected state without
  // becoming a stale closure (no need to re-create the callback on each render).
  const stompIsConnectedRef = useRef(false);
  stompIsConnectedRef.current = stomp.isConnected;

  // Called by useWebRTC when onnegotiationneeded fires on an established
  // connection. Let either peer re-offer when it changes tracks; glare is
  // handled in useWebRTC with rollback logic on incoming OFFER.
  const handleNegotiationNeeded = useCallback(() => {
    if (!stompIsConnectedRef.current) return;
    const localTracks = webrtcRef.current?.localStream
      ?.getTracks?.()
      .map((track) => track.kind);
    if (!localTracks || localTracks.length === 0) {
      console.warn("[Room] Renegotiation requested without local tracks");
      return;
    }
    console.log("[Room] Renegotiation needed — re-offering");
    webrtcRef.current?.createOffer();
  }, []);

  const webrtc = useWebRTC(session?.roomId, {
    onSignal: (signal) => {
      console.log(
        "[Room] Outgoing signal:",
        signal?.type,
        "room:",
        session?.roomId,
      );
      stomp.sendSignal(signal.type, signal.data);
    },
    onStream: (stream) =>
      console.log(
        "[Room] Remote stream updated — tracks:",
        stream?.getTracks?.().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        })),
      ),
    onPeerDisconnected: () => console.log("Peer disconnected"),
    onNegotiationNeeded: handleNegotiationNeeded,
  });
  webrtcRef.current = webrtc;

  // Initial Load: Appointment + Session + History
  useEffect(() => {
    const init = async () => {
      try {
        let appData = null;
        try {
          appData = await appointmentApi.getAppointment(appointmentId);
        } catch (e) {
          console.warn(
            "Failed to load appointment, fallback to waiting room",
            e,
          );
        }
        const channel = appData?.channel || "VIDEO_CALL";
        const sessionType = channel === "VOICE_CALL" ? "VOICE" : "VIDEO";
        const [sessionData, history] = await Promise.all([
          appointmentApi.getOrCreateSession(appointmentId, sessionType),
          appointmentApi.getChatHistory(appointmentId),
        ]);

        if (appData) {
          setAppointment(appData);
        }
        setSession(sessionData);
        const normalizedHistory = history
          .map((m) => normalizeChatMessage(m))
          .reverse();
        setMessages(normalizedHistory);

        // Join Session
        await appointmentApi.joinSession(sessionData.roomId);
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      init();
    }

    return () => {
      stomp.disconnect();
      webrtc.closeConnection();
    };
  }, [appointmentId, normalizeChatMessage, stomp, userId, webrtc]);

  useEffect(() => {
    if (session?.roomId) {
      stomp.connect();
    }
  }, [session?.roomId, stomp]);

  const channelType = normalizeSessionType(appointment?.channel);
  const sessionType = normalizeSessionType(session?.type);
  const effectiveType = channelType || sessionType || "VIDEO";

  // Start local media when session is active.
  // If video+audio fails (e.g. camera taken by another browser on the same
  // machine, or permission denied), fall back to audio-only so the peer
  // connection can still be established and the user can at least hear/speak.
  useEffect(() => {
    if (session && !webrtc.localStream) {
      const isVoice = effectiveType === "VOICE";
      const constraints = { audio: true, video: !isVoice };
      webrtc.startLocalStream(constraints).catch(() => {
        if (!isVoice) {
          // Video unavailable — retry with audio only
          webrtc
            .startLocalStream({ audio: true, video: false })
            .catch((err) => {
              console.warn("Could not access any media device:", err);
            });
        }
      });
    }
  }, [session, webrtc, webrtc.localStream, effectiveType]);

  // Reset offer/join flags when session changes (new session = new call)
  useEffect(() => {
    offerSentRef.current = false;
    joinSentRef.current = false;
  }, [session?.roomId]);

  // Only the PHARMACIST initiates the WebRTC offer, and only once STOMP is
  // connected so the signal isn't silently dropped before the channel is up.
  // offerTrigger increments when a peer sends JOIN (re-negotiation request).
  useEffect(() => {
    if (
      isPharmacistRole &&
      stomp.isConnected &&
      webrtc.localStream &&
      !offerSentRef.current
    ) {
      console.log(
        "[Room] Pharmacist offer effect — sending OFFER (trigger:",
        offerTrigger,
        ")",
      );
      offerSentRef.current = true;
      webrtc.createOffer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPharmacistRole, stomp.isConnected, webrtc.localStream, offerTrigger]);

  // USER/ADMIN: once STOMP is connected, send a JOIN signal immediately so the
  // PHARMACIST knows to send a fresh OFFER to this peer. Do NOT gate this on
  // webrtc.localStream — if the user has no camera (permission denied, 2nd
  // browser on same machine, etc.) localStream stays null and JOIN would never
  // be sent, causing a permanent deadlock.
  useEffect(() => {
    if (!isPharmacistRole && stomp.isConnected && !joinSentRef.current) {
      console.log("[Room] Patient/Admin — sending JOIN");
      joinSentRef.current = true;
      stomp.sendSignal("JOIN", {});
    }
  }, [isPharmacistRole, stomp, stomp.isConnected]);

  const handleSendMessage = async (text, note = null) => {
    const content = String(text || "").trim();
    if (!content) return;

    try {
      // Primary path: REST is authoritative and already broadcasts to
      // /topic/appointments/{appointmentId}/chat from backend.
      console.log("[Room] CHAT send via REST");
      const saved = await appointmentApi.sendChatMessage(
        appointmentId,
        content,
        note,
      );
      if (saved) {
        trackMessageId(saved.id);
        setMessages((prev) => {
          if (saved?.id && prev.some((item) => item.id === saved.id)) {
            return prev;
          }
          return [...prev, normalizeChatMessage(saved)];
        });
      }
    } catch (err) {
      console.warn("[Room] REST chat send failed, fallback to STOMP", err);
      const sentViaSocket = stomp.sendMessage(content, note);
      if (!sentViaSocket) {
        console.error("Failed to send message via both REST and STOMP");
      }
    }
  };

  const handleSaveNotes = async (notes) => {
    if (!canWriteNotes) return;
    try {
      await appointmentApi.updateConsultationNotes(appointmentId, notes);
    } catch (err) {
      console.error("Failed to save notes", err);
    }
  };

  const handleSearchPrescriptionProducts = useCallback(
    async (params) =>
      appointmentApi.searchConsultationPrescriptionProducts(appointmentId, {
        q: params?.q,
        page: params?.page ?? 0,
        size: params?.size ?? 10,
      }),
    [appointmentId],
  );

  const handleCreatePrescriptionOrder = useCallback(
    async (data) => {
      if (!isPharmacistRole) return null;

      const payload = {
        customerName: resolvePatientName(appointment) || undefined,
        customerPhone: resolvePatientContact(appointment) || undefined,
        note: data?.consultationNote || undefined,
        prescriptionTitle: data?.title || "Đơn thuốc tư vấn",
        prescriptionSummary: data?.summary || undefined,
        items: (data?.items || []).map((item) => ({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.unitPrice || 0),
          dose: item.dose,
          frequency: item.frequency,
          duration: item.duration,
          instruction: item.instruction,
        })),
      };

      return appointmentApi.createConsultationPrescriptionOrder(
        appointmentId,
        payload,
      );
    },
    [
      appointment,
      appointmentId,
      resolvePatientContact,
      resolvePatientName,
      isPharmacistRole,
    ],
  );

  const handleLeave = async () => {
    if (session?.roomId) {
      if (isPharmacistRole || role === "ADMIN") {
        await appointmentApi.endSession(session.roomId, messageIdsRef.current);
      } else {
        await appointmentApi.leaveSession(session.roomId);
      }
    }
    webrtc.closeConnection();
    stomp.disconnect();
    if (isPharmacistRole) navigate("/pharmacist/appointments");
    else if (role === "ADMIN") navigate("/admin/schedule");
    else navigate("/account");
  };

  const handleCreatePrescription = useCallback(
    (data) => {
      if (!isPharmacistRole) return;

      navigate("/pharmacist/pos", {
        state: {
          consultationDraft: {
            appointmentId,
            customerName: resolvePatientName(appointment),
            customerPhone: resolvePatientContact(appointment),
            note: data?.consultationNote || "",
            prescriptionSummary: data?.summary || "",
            prescriptionTitle: data?.title || "Đơn thuốc tư vấn",
          },
        },
      });
    },
    [
      appointment,
      appointmentId,
      navigate,
      resolvePatientContact,
      resolvePatientName,
      isPharmacistRole,
    ],
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        Đang kết nối...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <TopBar
        role={role}
        pharmacistName={
          appointment?.pharmacist?.fullName ||
          appointment?.pharmacistName ||
          "Dược sĩ"
        }
        patientName={appointment?.patientName || "Bệnh nhân"}
        status={session?.status}
      />

      <main className="flex-1 flex overflow-hidden">
        <VideoStage
          localStream={webrtc.localStream}
          remoteStream={webrtc.remoteStream}
          patientName={appointment?.patientName || "Bệnh nhân"}
          pharmacistName={
            appointment?.pharmacist?.fullName ||
            appointment?.pharmacistName ||
            "Dược sĩ"
          }
          role={role}
          isLocalCamOff={!webrtc.isVideoEnabled}
          isRemoteCamOff={
            effectiveType === "VOICE" ||
            !webrtc.remoteStream
              ?.getVideoTracks?.()
              .some(
                (track) => track.readyState === "live" && track.muted !== true,
              )
          }
        />

        <SidePanel
          role={role}
          messages={messages}
          onSendMessage={handleSendMessage}
          onSaveNotes={handleSaveNotes}
          canWriteNotes={canWriteNotes}
          initialNotes={appointment.notes}
          onCreatePrescription={handleCreatePrescription}
          onSearchPrescriptionProducts={handleSearchPrescriptionProducts}
          onCreatePrescriptionOrder={handleCreatePrescriptionOrder}
        />
      </main>

      <ControlBar
        isAudioEnabled={webrtc.isAudioEnabled}
        isVideoEnabled={webrtc.isVideoEnabled}
        isScreenSharing={webrtc.isScreenSharing}
        toggleAudio={webrtc.toggleAudio}
        toggleVideo={webrtc.toggleVideo}
        toggleScreenShare={webrtc.toggleScreenShare}
        onLeave={handleLeave}
        channel={effectiveType}
      />
    </div>
  );
};

export default ConsultationRoomPage;
