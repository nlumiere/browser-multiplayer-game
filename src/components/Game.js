import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { getTimestamp, sendWebsocketUpdate } from '../network/network';

const SPEED = 200;
const WS_PORT = 8080;
const HOSTNAME = 'localhost';

// TODO: Replace with login
const USERNAME = 'TEST USER';

const websocket = new WebSocket(`ws://${HOSTNAME}:${WS_PORT}`);

function Game() {
  const [characterPos, setCharacterPos] = useState({ x: 20, y: 20 });
  const [connection, setConnection] = useState(false);

  const peerConnection = new RTCPeerConnection();
  const dataChannel = peerConnection.createDataChannel('dataChannel');

  dataChannel.onopen = () => {
    dataChannel.send({ data: 'Hello from React!' });
  };

  dataChannel.onmessage = (event) => {
    console.log('Received data from peer:', event.data);
  };

  websocket.onopen = (event) => {
    websocket.send(JSON.stringify({ type: 'handshake', username: USERNAME }));
    setConnection(true);
    console.log('Websocket connection established.', event);
  };

  websocket.onmessage = (ws, event) => {
    console.log(event);
  };

  const onErrorClose = () => {
    console.error('NO CONNECTION');
    setConnection(false);
  };

  websocket.onclose = onErrorClose;
  websocket.onerror = onErrorClose;

  useEffect(() => {
    if (!connection) {
      return;
    }

    var playerPos = { x: 20, y: 20 };
    var movementButtons = { w: false, s: false, a: false, d: false };
    var lastMovementTime = new Date().getTime();

    const isMovementEquivalent = (a, b) => {
      return a.w === b.w && a.s === b.s && a.a === b.a && a.d === b.d;
    };

    const isNothingPressed = (movement) => {
      return movement.w + movement.s + movement.a + movement.d === 0;
    };

    const tickInterval = setInterval(() => {
      if (!isNothingPressed(movementButtons)) {
        const now = getTimestamp();
        movePlayerLocal(now);
        lastMovementTime = now;
      }
    }, 15);

    const getUpdatedMovement = (event, isKeydown) => {
      const updatedMovement = {
        w: movementButtons.w,
        s: movementButtons.s,
        a: movementButtons.a,
        d: movementButtons.d,
      };
      switch (event.key) {
        case 'w':
          updatedMovement.w = isKeydown;
          break;
        case 's':
          updatedMovement.s = isKeydown;
          break;
        case 'a':
          updatedMovement.a = isKeydown;
          break;
        case 'd':
          updatedMovement.d = isKeydown;
          break;
        default:
          return updatedMovement;
      }
      return updatedMovement;
    };

    const handleKeyPress = (event, isKeydown) => {
      const timestamp = getTimestamp();
      if (isNothingPressed(movementButtons)) {
        lastMovementTime = timestamp;
      }
      const updatedMovement = getUpdatedMovement(event, isKeydown);
      if (!isMovementEquivalent(movementButtons, updatedMovement)) {
        movementButtons = updatedMovement;
        sendWebsocketUpdate(websocket, {
          type: 'movement',
          username: USERNAME,
          timestamp: timestamp,
          movement: updatedMovement,
        });
      }
    };

    window.addEventListener('keydown', (event) => {
      handleKeyPress(event, true);
    });

    window.addEventListener('keyup', (event) => {
      handleKeyPress(event, false);
    });

    // This function is responsible for calculating and moving the player locally
    // Not to calculate the position and send to the server.
    // The server will do its own calculations and send verification to the client.
    const movePlayerLocal = (timestamp) => {
      const w = movementButtons.w;
      const s = movementButtons.s;
      const a = movementButtons.a;
      const d = movementButtons.d;
      const y = s - w;
      const x = d - a;
      if (x === 0 && y === 0) {
        return;
      }
      const multiplier =
        Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) /
        (Math.abs(x) + Math.abs(y));
      const dt = timestamp - lastMovementTime;
      const dx = SPEED * multiplier * x * (dt / 1000);
      const dy = SPEED * multiplier * y * (dt / 1000);
      console.log(dx, dy);
      playerPos = {
        x: Math.round(playerPos.x + dx),
        y: Math.round(playerPos.y + dy),
      };
      console.log('POSTMOVE', playerPos);
      setCharacterPos(playerPos);
    };
    return () => clearInterval(tickInterval);
  }, [connection]);

  return (
    <div className='Game'>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect
            width={50}
            height={50}
            x={characterPos.x}
            y={characterPos.y}
            fill='red'
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default Game;
