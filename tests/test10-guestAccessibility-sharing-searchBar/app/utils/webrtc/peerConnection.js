import { getOrCreateDtlsCertificate } from './dtlsCertificate.js';
import { WebRTCSignalingClient } from './signalingClient.js';
import { validateConnectRoom } from '../validators.js';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

function attachDataChannel(dc, handlers) {
  dc.onopen = () => handlers.onOpen?.();
  dc.onclose = () => handlers.onClose?.();
  dc.onmessage = event => {
    try {
      handlers.onMessage?.(JSON.parse(String(event.data)));
    } catch {
      handlers.onMessage?.(event.data);
    }
  };
}

async function createOffer(pc, signaling, handlers) {
  let dc = pc.createDataChannel('memome', { ordered: true });
  attachDataChannel(dc, handlers);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  signaling.sendSignal({ sdp: pc.localDescription });
  return dc;
}

/**
 * Join a room and establish a WebRTC data channel with peers on other devices.
 * Uses a persistent DTLS certificate per browser profile.
 */
export async function connectToRoom(roomId, handlers = {}) {
  const roomResult = validateConnectRoom(roomId);
  if (roomResult.field) {
    throw new Error(roomResult.message);
  }
  const room = roomResult.value;

  const cert = await getOrCreateDtlsCertificate();
  const pc = new RTCPeerConnection({ certificates: [cert], iceServers: ICE_SERVERS });

  let dc = null;

  pc.onicecandidate = event => {
    if (event.candidate) {
      signaling.sendSignal({ candidate: event.candidate });
    }
  };

  pc.onconnectionstatechange = () => {
    handlers.onConnectionState?.(pc.connectionState);
  };

  pc.ondatachannel = event => {
    dc = event.channel;
    attachDataChannel(dc, handlers);
  };

  const signaling = new WebRTCSignalingClient(
    async payload => {
      if (payload.sdp) {
        await pc.setRemoteDescription(payload.sdp);
        if (payload.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          signaling.sendSignal({ sdp: pc.localDescription });
        }
      }
      if (payload.candidate) {
        try {
          await pc.addIceCandidate(payload.candidate);
        } catch {
          /* ignore stale candidates */
        }
      }
    },
    async () => {
      if (!pc.localDescription) {
        dc = await createOffer(pc, signaling, handlers);
      }
    },
  );

  const { peers } = await signaling.connect(room);

  if (peers > 1) {
    /* Second device: wait for offer from the host already in the room. */
  } else {
    /* First device: offer is sent when a peer joins (peer-joined event). */
  }

  return {
    pc,
    get dataChannel() {
      return dc;
    },
    send(data) {
      if (dc?.readyState === 'open') {
        dc.send(typeof data === 'string' ? data : JSON.stringify(data));
      }
    },
    disconnect() {
      signaling.close();
      dc?.close();
      pc.close();
    },
  };
}

export function getDeviceShareUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.protocol}//${window.location.host}`;
}
