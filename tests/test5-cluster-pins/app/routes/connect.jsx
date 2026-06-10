import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import ConnectQr from '../components/ConnectQr';
import { useDevShareOrigin } from '../utils/devShareOrigin';
import { connectToRoom } from '../utils/webrtc/peerConnection.js';

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function ConnectPage() {
  const { shareOrigin, lanUrls, isOnLocalhost } = useDevShareOrigin();
  const [room, setRoom] = useState(() => randomRoomCode());
  const [status, setStatus] = useState('idle');
  const [connectionState, setConnectionState] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const sessionRef = useRef(null);
  const shareUrl = shareOrigin
    ? `${shareOrigin}/connect?room=${encodeURIComponent(room)}`
    : '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('room');
    if (fromQuery) setRoom(fromQuery.toUpperCase().slice(0, 64));
  }, []);

  const disconnect = useCallback(() => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    setStatus('idle');
    setConnectionState('');
  }, []);

  const connect = useCallback(async () => {
    disconnect();
    setStatus('connecting');
    setMessages([]);

    try {
      const session = await connectToRoom(room.trim(), {
        onOpen: () => {
          setStatus('connected');
          setMessages(prev => [...prev, { from: 'system', text: 'Data channel open — peers can exchange messages.' }]);
        },
        onClose: () => {
          setStatus('idle');
          setConnectionState('closed');
        },
        onConnectionState: state => setConnectionState(state),
        onMessage: payload => {
          setMessages(prev => [...prev, { from: 'peer', text: payload?.text ?? JSON.stringify(payload) }]);
        },
      });
      sessionRef.current = session;
      setStatus('waiting');
    } catch (err) {
      setStatus('error');
      setMessages([{ from: 'system', text: err?.message ?? 'Could not connect.' }]);
    }
  }, [disconnect, room]);

  useEffect(() => () => disconnect(), [disconnect]);

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !sessionRef.current) return;
    sessionRef.current.send({ text, at: Date.now() });
    setMessages(prev => [...prev, { from: 'me', text }]);
    setDraft('');
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessages(prev => [...prev, { from: 'system', text: 'Link copied to clipboard.' }]);
    } catch {
      setMessages(prev => [...prev, { from: 'system', text: shareUrl }]);
    }
  }

  const isSecure = typeof window !== 'undefined' && window.isSecureContext;

  return (
    <main className="connect-page">
      <header className="connect-header">
        <Link to="/profile" className="connect-back" aria-label="Back to profile">
          ←
        </Link>
        <h1 className="connect-title">Connect devices</h1>
      </header>

      <section className="connect-card">
        <p className="connect-lead">
          Open this app on another phone or laptop on the same Wi‑Fi, then join the same room code.
          WebRTC uses a persistent DTLS certificate on each device for encrypted peer links.
        </p>

        {!isSecure && (
          <p className="connect-warn">
            WebRTC requires HTTPS. Run <code>npm run dev:lan</code> and trust the dev certificate on each device.
          </p>
        )}

        {isOnLocalhost && lanUrls.length > 0 && (
          <p className="connect-warn">
            Other devices cannot open <code>localhost</code>. Use the Network URL below (same Wi‑Fi). If it still fails,
            allow incoming connections for Node in macOS Firewall settings.
          </p>
        )}

        <label className="connect-label" htmlFor="room-code">
          Room code
        </label>
        <div className="connect-room-row">
          <input
            id="room-code"
            className="connect-input"
            value={room}
            onChange={e => setRoom(e.target.value.toUpperCase().slice(0, 64))}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="connect-secondary" onClick={() => setRoom(randomRoomCode())}>
            New
          </button>
        </div>

        <ConnectQr url={shareUrl} room={room} />

        <p className="connect-share-label">Or copy link</p>
        <div className="connect-share-row">
          <code className="connect-share-url">{shareUrl || '…'}</code>
          <button type="button" className="connect-secondary" onClick={copyShareUrl}>
            Copy
          </button>
        </div>

        <div className="connect-actions">
          {status === 'connected' || status === 'waiting' ? (
            <button type="button" className="connect-primary connect-primary--muted" onClick={disconnect}>
              Disconnect
            </button>
          ) : (
            <button type="button" className="connect-primary" onClick={connect} disabled={!room.trim() || status === 'connecting'}>
              {status === 'connecting' ? 'Connecting…' : 'Join room'}
            </button>
          )}
        </div>

        <p className="connect-status">
          Status: <strong>{status}</strong>
          {connectionState ? ` · ICE ${connectionState}` : ''}
        </p>
      </section>

      {(status === 'connected' || status === 'waiting') && (
        <section className="connect-card connect-chat">
          <h2 className="connect-subtitle">Messages</h2>
          <ul className="connect-messages">
            {messages.map((msg, index) => (
              <li key={index} className={`connect-msg connect-msg--${msg.from}`}>
                {msg.text}
              </li>
            ))}
          </ul>
          <form className="connect-compose" onSubmit={sendMessage}>
            <input
              className="connect-input"
              placeholder="Say hello to the other device…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              disabled={status !== 'connected'}
            />
            <button type="submit" className="connect-primary" disabled={status !== 'connected' || !draft.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      {status === 'error' && messages.length > 0 && (
        <p className="connect-error">{messages[0].text}</p>
      )}
    </main>
  );
}
