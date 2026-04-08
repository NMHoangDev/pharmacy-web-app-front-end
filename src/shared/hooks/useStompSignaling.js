import { useRef, useEffect, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken } from "../utils/auth";

export const useStompSignaling = (appointmentId, roomId, onMessage) => {
  const clientRef = useRef(null);
  const clientSignalIdRef = useRef(
    `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  );
  const roomIdRef = useRef(null);
  const subsRef = useRef({ signal: null, chat: null, session: null });
  const pendingChatRef = useRef([]);
  const pendingSignalsRef = useRef([]);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (clientRef.current) return;

    if (!appointmentId) return null;

    roomIdRef.current = roomId || null;

    const token = getAccessToken();
    const socketFactory = () =>
      new SockJS(
        `${process.env.REACT_APP_API_URL || "http://localhost:8087"}/ws`,
      );

    const client = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 1500,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log(
          "[STOMP] Connected, roomId:",
          roomIdRef.current || "(waiting for consultation room)",
        );

        subsRef.current.chat = client.subscribe(
          `/topic/appointments/${appointmentId}/chat`,
          (message) => {
            onMessage?.({ type: "CHAT", payload: JSON.parse(message.body) });
          },
        );

        subsRef.current.session = client.subscribe(
          `/topic/appointments/${appointmentId}/call`,
          (message) => {
            onMessage?.({ type: "SESSION", payload: JSON.parse(message.body) });
          },
        );

        if (roomIdRef.current) {
          subsRef.current.signal = client.subscribe(
            `/topic/calls/${roomIdRef.current}/signal`,
            (message) => {
              const parsed = JSON.parse(message.body);
              onMessage?.({
                type: "SIGNAL",
                payload: {
                  ...parsed,
                  _isOwnClientSignal:
                    parsed?.data?._clientSignalId === clientSignalIdRef.current,
                },
              });
            },
          );
        }

        setIsConnected(true);

        if (pendingSignalsRef.current.length > 0 && roomIdRef.current) {
          const queuedSignals = [...pendingSignalsRef.current];
          pendingSignalsRef.current = [];
          queuedSignals.forEach((item) => {
            client.publish({
              destination: `/app/calls/${roomIdRef.current}/signal.${item.type}`,
              body: JSON.stringify(item.payload),
            });
          });
          console.log("[STOMP] Flushed queued signals:", queuedSignals.length);
        }

        if (pendingChatRef.current.length > 0) {
          const queued = [...pendingChatRef.current];
          pendingChatRef.current = [];
          queued.forEach((item) => {
            client.publish({
              destination: `/app/appointments/${appointmentId}/chat.send`,
              body: JSON.stringify(item),
            });
          });
        }
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;
    return client;
  }, [appointmentId, roomId, onMessage]);

  const sendSignal = useCallback((type, data) => {
    if (!type) return false;

    const normalizedType = type.toLowerCase();
    const payload = {
      ...(data || {}),
      _clientSignalId: clientSignalIdRef.current,
    };

    if (clientRef.current?.connected && roomIdRef.current) {
      const dest = `/app/calls/${roomIdRef.current}/signal.${normalizedType}`;
      clientRef.current.publish({
        destination: dest,
        body: JSON.stringify(payload),
      });
      console.log("[STOMP] Signal sent:", type, "room:", roomIdRef.current);
      return true;
    }

    pendingSignalsRef.current.push({
      type: normalizedType,
      payload,
    });
    console.log("[STOMP] Signal queued:", type);
    return false;
  }, []);

  const sendMessage = useCallback(
    (content, note = null) => {
      if (clientRef.current?.connected) {
        try {
          clientRef.current.publish({
            destination: `/app/appointments/${appointmentId}/chat.send`,
            body: JSON.stringify({ content, note }),
          });
          return true;
        } catch (error) {
          console.warn("[STOMP] Publish chat failed, queueing", error);
        }
      }
    },
    [appointmentId],
  );

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    const nextRoomId = roomId || null;
    const prevRoomId = roomIdRef.current;
    roomIdRef.current = nextRoomId;

    if (!clientRef.current || prevRoomId === nextRoomId) {
      return;
    }

    // Reconnect whenever room binding changes, even if the client is still
    // activating. This prevents getting stuck with subscriptions created while
    // roomId was null.
    disconnect();
    connect();
  }, [roomId, connect, disconnect]);

  return {
    connect,
    disconnect,
    sendSignal,
    sendMessage,
    isConnected,
  };
};
