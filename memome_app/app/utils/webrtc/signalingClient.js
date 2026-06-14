const WS_PATH = '/ws/webrtc';

function wsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${WS_PATH}`;
}

export class WebRTCSignalingClient {
  /**
   * @param {(payload: object) => void} onSignal
   * @param {() => void} [onPeerJoined]
   */
  constructor(onSignal, onPeerJoined) {
    this.onSignal = onSignal;
    this.onPeerJoined = onPeerJoined;
    this.ws = null;
    this.room = null;
  }

  connect(room) {
    this.room = room;
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl());
      this.ws = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', room }));
      };

      ws.onmessage = event => {
        let msg;
        try {
          msg = JSON.parse(String(event.data));
        } catch {
          return;
        }

        if (msg.type === 'joined') {
          resolve({ peers: msg.peers ?? 1 });
          return;
        }

        if (msg.type === 'peer-joined') {
          this.onPeerJoined?.();
          return;
        }

        if (msg.type === 'signal' && msg.payload) {
          this.onSignal(msg.payload);
        }
      };

      ws.onerror = () => reject(new Error('Signaling connection failed'));
      ws.onclose = () => {
        this.ws = null;
      };
    });
  }

  sendSignal(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'signal', payload }));
  }

  close() {
    this.ws?.close();
    this.ws = null;
  }
}
