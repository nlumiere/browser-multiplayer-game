import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect } from 'react-konva';

function Game() {
	const SPEED = 10
	const [characterPos, setCharacterPos] = useState({x:20, y:20});
	var playerPos = {x:20, y:20}
	var movementButtons = {x: 0, y: 0}
	var tickCount = 0

	useEffect(() => {
		const tickInterval = setInterval(() => {
			tickCount++;
			movePlayer()
		}, 30);

		return () => clearInterval(tickInterval);
	}, [])

	window.addEventListener('keydown', (event) => {
		const updatedMovement = {x: movementButtons.x, y: movementButtons.y}
		switch(event.key) {
			case 'w':
				updatedMovement.y = -1
				break;
			case 's':
				updatedMovement.y = 1
				break;
			case 'a':
				updatedMovement.x = -1
				break;
			case 'd':
				updatedMovement.x = 1
				break;
			default:
				return;
		}
		movementButtons = updatedMovement
	})

	window.addEventListener('keyup', (event) => {
		const updatedMovement = {x: movementButtons.x, y: movementButtons.y}
		switch(event.key) {
			case 's':
				updatedMovement.y = 0
				break;
			case 'w':
				updatedMovement.y = 0
				break;
			case 'd':
				updatedMovement.x = 0
				break;
			case 'a':
				updatedMovement.x = 0
				break;
			default:
				return;
		}
		movementButtons = updatedMovement
	})

	const movePlayer = () => {
		const x = movementButtons.x
		const y = movementButtons.y
		if (Math.abs(x) + Math.abs(y) === 0) {
			return;
		}
		const multiplier = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))/(Math.abs(x) + Math.abs(y))
		console.log(playerPos)
		playerPos = {
			x: playerPos.x + Math.floor(SPEED*multiplier*movementButtons.x),
			y: playerPos.y + Math.floor(SPEED*multiplier*movementButtons.y)
		}
		setCharacterPos(playerPos);
	}

  return (
    <div className="Game">
      <Stage width={window.innerWidth} height={window.innerHeight}>
				<Layer>
					<Rect width={50} height={50} x={characterPos.x} y={characterPos.y} fill="red" />
				</Layer>
			</Stage>
    </div>
  );
}

export default Game;
