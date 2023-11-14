import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { getTimestamp, sendWebsocketUpdate } from '../network/network';

const SPEED = 10;
const WS_PORT = 8080;
const HOSTNAME = 'localhost';

const websocket = new WebSocket(`ws://${HOSTNAME}:${WS_PORT}`);

function Game() {
  const [characterPos, setCharacterPos] = useState({ x: 20, y: 20 });
  const [connection, setConnection] = useState(false);
  var playerPos = { x: 20, y: 20 };
  var movementButtons = { w: false, s: false, a: false, d: false };

  const peerConnection = new RTCPeerConnection();
  const dataChannel = peerConnection.createDataChannel('dataChannel');

  dataChannel.onopen = () => {
    dataChannel.send({ data: 'Hello from React!' });
  };

  dataChannel.onmessage = (event) => {
    console.log('Received data from peer:', event.data);
  };

  websocket.onopen = (event) => {
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

    const tickInterval = setInterval(() => {
      movePlayerLocal();
    }, 20);

    window.addEventListener('keydown', (event) => {
      const updatedMovement = {
        w: movementButtons.w,
        s: movementButtons.s,
        a: movementButtons.a,
        d: movementButtons.d,
      };
      switch (event.key) {
        case 'w':
          updatedMovement.w = true;
          break;
        case 's':
          updatedMovement.s = true;
          break;
        case 'a':
          updatedMovement.a = true;
          break;
        case 'd':
          updatedMovement.d = true;
          break;
        default:
          return;
      }

      if (movementButtons !== updatedMovement) {
        movementButtons = updatedMovement;
        const timestamp = getTimestamp();
        console.log(timestamp);
        sendWebsocketUpdate(websocket, timestamp, {
          type: 'movement',
          movement: updatedMovement,
        });
      }
    });

    window.addEventListener('keyup', (event) => {
      const updatedMovement = {
        w: movementButtons.w,
        s: movementButtons.s,
        a: movementButtons.a,
        d: movementButtons.d,
      };
      switch (event.key) {
        case 's':
          updatedMovement.s = false;
          break;
        case 'w':
          updatedMovement.w = false;
          break;
        case 'd':
          updatedMovement.d = false;
          break;
        case 'a':
          updatedMovement.a = false;
          break;
        default:
          return;
      }

      if (movementButtons !== updatedMovement) {
        movementButtons = updatedMovement;
        const timestamp = getTimestamp();
        console.log(timestamp);
        sendWebsocketUpdate(websocket, timestamp, {
          type: 'movement',
          movement: updatedMovement,
        });
      }
    });

    // This function is responsible for calculating and moving the player locally
    // Not to calculate the position and send to the server.
    // The server will do its own calculations and send verification to the client.
    const movePlayerLocal = () => {
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
      console.log(playerPos);
      playerPos = {
        x: playerPos.x + Math.floor(SPEED * multiplier * x),
        y: playerPos.y + Math.floor(SPEED * multiplier * y),
      };
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
