import os from 'node:os';
import { WebSocketServer } from 'ws';

const WS_PATH = '/ws/webrtc';

/** In-memory room → connected clients */
const rooms = new Map();

function getLanUrls(port) {
  try {
    const ips = Object.values(os.networkInterfaces())
      .flat()
      .filter(Boolean)
      .filter(entry => entry.family === 'IPv4' && !entry.internal)
      .map(entry => entry.address);
    return ips.map(ip => `https://${ip}:${port}`);
  } catch {
    return [];
  }
}

function broadcast(roomId, sender, payload) {
  const peers = rooms.get(roomId);
  if (!peers) return;
  for (const client of peers) {
    if (client !== sender && client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  }
}

function removeClient(ws) {
  const roomId = ws.roomId;
  if (!roomId) return;
  const peers = rooms.get(roomId);
  if (!peers) return;
  peers.delete(ws);
  if (peers.size === 0) rooms.delete(roomId);
  else broadcast(roomId, ws, { type: 'peer-left' });
}

export function webrtcSignalingPlugin() {
  return {
    name: 'webrtc-signaling',
    configureServer(server) {
      const httpServer = server.httpServer;
      if (!httpServer) return;

      const wss = new WebSocketServer({ noServer: true });

      httpServer.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url ?? '', 'http://localhost');
        if (url.pathname !== WS_PATH) return;
        wss.handleUpgrade(req, socket, head, ws => {
          wss.emit('connection', ws, req);
        });
      });

      wss.on('connection', ws => {
        ws.on('message', raw => {
          let msg;
          try {
            msg = JSON.parse(String(raw));
          } catch {
            return;
          }

          if (msg.type === 'join' && msg.room) {
            const roomId = String(msg.room).slice(0, 64);
            ws.roomId = roomId;
            if (!rooms.has(roomId)) rooms.set(roomId, new Set());
            rooms.get(roomId).add(ws);
            ws.send(JSON.stringify({ type: 'joined', room: roomId, peers: rooms.get(roomId).size }));
            broadcast(roomId, ws, { type: 'peer-joined' });
            return;
          }

          if (msg.type === 'signal' && ws.roomId && msg.payload) {
            broadcast(ws.roomId, ws, { type: 'signal', payload: msg.payload });
          }
        });

        ws.on('close', () => removeClient(ws));
        ws.on('error', () => removeClient(ws));
      });

      httpServer.once('listening', () => {
        const address = httpServer.address();
        const port = typeof address === 'object' && address ? address.port : 5173;
        const lan = getLanUrls(port);
        console.log('\n[webrtc] Signaling: wss?://<host>:' + port + WS_PATH);
        if (lan.length) {
          console.log('[webrtc] Other devices can open:');
          for (const url of lan) console.log('  → ' + url);
          console.log('[webrtc] Share links must use a Network URL above — not localhost.');
        }
        console.log('');
      });

      server.middlewares.use('/api/dev-network', (req, res, next) => {
        if (req.method !== 'GET') return next();
        const address = httpServer.address();
        const port = typeof address === 'object' && address ? address.port : 5173;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            port,
            lanUrls: getLanUrls(port),
            localhostUrl: `https://localhost:${port}`,
          }),
        );
      });
    },
  };
}

export { WS_PATH };
