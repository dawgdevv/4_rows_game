import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Group,
  Path,
  RegularPolygon,
  Line,
} from "react-konva";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";
import { ROWS, COLS, ActiveDrop } from "../types";
import Konva from "konva";
import { animate } from "framer-motion";

const PADDING = 32;
const FRAME_THICKNESS = 24;
const HOLE_RADIUS = 36;
const CELL_SIZE = 96;

const INNER_BOARD_WIDTH = COLS * CELL_SIZE + PADDING * 2;
const INNER_BOARD_HEIGHT = ROWS * CELL_SIZE + PADDING * 2;
const TOTAL_BOARD_WIDTH = INNER_BOARD_WIDTH + FRAME_THICKNESS * 2;
const TOTAL_BOARD_HEIGHT = INNER_BOARD_HEIGHT + FRAME_THICKNESS * 2;

const LEG_WIDTH = 140;
const STAGE_WIDTH = TOTAL_BOARD_WIDTH + LEG_WIDTH * 2;
const STAGE_HEIGHT = TOTAL_BOARD_HEIGHT + 350;
const BOARD_Y_OFFSET = 140;

const ColumnArrow: React.FC<{ colIndex: number; player: number; color: string }> = ({
  colIndex,
  player,
  color,
}) => {
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const controls = animate(0, 12, {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 0.6,
      ease: "easeInOut",
      onUpdate: (val) => {
        if (groupRef.current) {
          groupRef.current.y(-80 + val);
        }
      },
    });
    return () => controls.stop();
  }, [colIndex]);

  const x = FRAME_THICKNESS + PADDING + colIndex * CELL_SIZE + CELL_SIZE / 2;

  return (
    <Group x={x} y={-80} ref={groupRef}>
      <Path
        data="M -15 -25 L 15 -25 L 15 0 L 30 0 L 0 30 L -30 0 L -15 0 Z"
        fill="black"
        opacity={0.3}
        x={6}
        y={6}
      />
      <Path
        data="M -15 -25 L 15 -25 L 15 0 L 30 0 L 0 30 L -30 0 L -15 0 Z"
        fill={color}
        stroke="black"
        strokeWidth={3}
        lineJoin="round"
      />
      <Path
        data="M -5 -20 L 5 -20 L 5 -5"
        stroke="white"
        strokeWidth={3}
        opacity={0.5}
        lineCap="round"
      />
    </Group>
  );
};

const AnimatedBolt: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const boltRef = useRef<Konva.Group>(null);

  useEffect(() => {
    if (!boltRef.current) return;

    const controls = animate(0, 1, {
      duration: 1.8,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      onUpdate: (val) => {
        if (!boltRef.current) return;
        const scale = 1 + val * 0.08;
        boltRef.current.scale({ x: scale, y: scale });
        boltRef.current.rotation(val * 12);
        boltRef.current.opacity(0.85 + val * 0.15);
      },
    });

    return () => controls.stop();
  }, []);

  return (
    <Group x={x} y={y} ref={boltRef} listening={false}>
      <Circle radius={16} stroke="#0b1220" strokeWidth={3} opacity={0.35} />
      <Circle radius={12} fill="#0f172a" stroke="black" strokeWidth={4} />
      <Circle radius={9} fill="#cbd5e1" stroke="#1f2937" strokeWidth={2} />
      <RegularPolygon
        sides={6}
        radius={6}
        fill="#94a3b8"
        stroke="#0f172a"
        strokeWidth={1.5}
      />
      <Line
        points={[-6, 0, 6, 0]}
        stroke="#1e293b"
        strokeWidth={2}
        lineCap="round"
      />
      <Line
        points={[0, -6, 0, 6]}
        stroke="#1e293b"
        strokeWidth={2}
        lineCap="round"
      />
      <Arc
        radius={10}
        angle={50}
        rotation={-30}
        stroke="white"
        strokeWidth={2}
        opacity={0.3}
        lineCap="round"
      />
      <Circle radius={20} stroke="#38bdf8" strokeWidth={1.4} opacity={0.12} />
      <Circle radius={24} stroke="#fbbf24" strokeWidth={1} opacity={0.08} />
    </Group>
  );
};

const Arc: React.FC<any> = (props) => (
  <Path
    {...props}
    data={`M ${props.radius} 0 A ${props.radius} ${props.radius} 0 0 1 ${props.radius * Math.cos((props.angle * Math.PI) / 180)
      } ${props.radius * Math.sin((props.angle * Math.PI) / 180)}`}
  />
);

const BrutalistDisc: React.FC<{
  color: string;
  radius: number;
  isWinning?: boolean;
}> = ({ color, radius, isWinning }) => (
  <Group>
    <Circle radius={radius} fill="black" x={3} y={3} opacity={0.3} />
    <Circle radius={radius} fill={color} stroke="black" strokeWidth={3} />
    <Path
      data={`M ${-radius * 0.5} ${-radius * 0.5} Q ${0} ${-radius * 0.9} ${radius * 0.5
        } ${-radius * 0.5} L ${radius * 0.3} ${-radius * 0.2} Q ${0} ${-radius * 0.5
        } ${-radius * 0.3} ${-radius * 0.2} Z`}
      fill="white"
      opacity={0.5}
    />
    <Arc
      radius={radius - 8}
      angle={60}
      rotation={120}
      stroke="white"
      strokeWidth={2}
      opacity={0.2}
      lineCap="round"
    />
    <Circle radius={12} fill="black" opacity={0.1} />
    <Circle radius={6} fill="black" opacity={0.1} />
    {isWinning && (
      <Group>
        <Circle
          radius={radius + 6}
          stroke="white"
          strokeWidth={5}
          opacity={1}
        />
        <RegularPolygon
          sides={5}
          radius={radius * 0.4}
          fill="white"
          stroke="black"
          strokeWidth={2}
          rotation={0}
        />
      </Group>
    )}
  </Group>
);

const DroppingDisc: React.FC<{
  drop: ActiveDrop;
  onLand: () => void;
  onImpact: () => void;
  color: string;
}> = ({ drop, onLand, onImpact, color }) => {
  const groupRef = useRef<Konva.Group>(null);

  const startY = -200;
  const targetY =
    FRAME_THICKNESS + PADDING + drop.row * CELL_SIZE + CELL_SIZE / 2;
  const x = FRAME_THICKNESS + PADDING + drop.col * CELL_SIZE + CELL_SIZE / 2;

  useEffect(() => {
    if (!groupRef.current) return;

    // Flag to track if component is mounted
    let isMounted = true;

    const controls = animate(startY, targetY, {
      type: "spring",
      damping: 25,
      stiffness: 350,
      mass: 1.2,
      onUpdate: (value) => {
        if (isMounted && groupRef.current) {
          groupRef.current.y(value);
        }
      },
      onComplete: () => {
        if (isMounted) {
          onImpact();
          onLand();
        }
      },
    });

    return () => {
      isMounted = false;
      controls.stop();
    };
  }, [drop.row, drop.col, onLand, onImpact, targetY]);

  return (
    <Group ref={groupRef} x={x} y={startY}>
      <BrutalistDisc
        color={color}
        radius={HOLE_RADIUS - 1}
      />
    </Group>
  );
};

const BoardLeg: React.FC<{ height: number; side: "left" | "right" }> = ({
  height,
  side,
}) => {
  const isLeft = side === "left";
  const baseH = 20;

  return (
    <Group>
      <Rect
        x={isLeft ? 40 : 20}
        y={10}
        width={60}
        height={height + 60}
        fill="black"
        opacity={0.3}
      />

      <Group y={height + 40} x={isLeft ? 0 : 0}>
        <Rect
          x={0}
          y={0}
          width={140}
          height={baseH}
          fill="#1e293b"
          stroke="black"
          strokeWidth={4}
          cornerRadius={4}
        />
        <Rect
          x={10}
          y={-10}
          width={120}
          height={10}
          fill="#334155"
          stroke="black"
          strokeWidth={3}
        />
        <Circle
          x={20}
          y={10}
          radius={5}
          fill="#94a3b8"
          stroke="black"
          strokeWidth={1}
        />
        <Circle
          x={120}
          y={10}
          radius={5}
          fill="#94a3b8"
          stroke="black"
          strokeWidth={1}
        />
      </Group>

      <Rect
        x={isLeft ? 30 : 30}
        y={-40}
        width={80}
        height={height + 80}
        fill="#334155"
        stroke="black"
        strokeWidth={4}
      />

      <Rect
        x={isLeft ? 45 : 45}
        y={-30}
        width={50}
        height={height + 60}
        fill="#0f172a"
        stroke="black"
        strokeWidth={2}
      />
      <Group
        clipX={isLeft ? 45 : 45}
        clipY={-30}
        clipWidth={50}
        clipHeight={height + 60}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Rect
            key={i}
            x={isLeft ? 50 : 50}
            y={-20 + i * 40}
            width={40}
            height={4}
            fill="#1e293b"
          />
        ))}
      </Group>

      <Group y={height * 0.4} x={isLeft ? 30 : 30}>
        <Rect
          x={-10}
          y={-30}
          width={100}
          height={60}
          fill="#475569"
          stroke="black"
          strokeWidth={3}
          cornerRadius={4}
        />
        <Circle
          x={50}
          y={0}
          radius={15}
          fill="#e2e8f0"
          stroke="black"
          strokeWidth={3}
        />
        <RegularPolygon
          x={50}
          y={0}
          sides={6}
          radius={8}
          fill="#94a3b8"
          stroke="black"
          strokeWidth={1}
        />
      </Group>
    </Group>
  );
};

const GrandBoardFrame: React.FC = () => {
  return (
    <Group>
      <Rect
        x={0}
        y={0}
        width={TOTAL_BOARD_WIDTH}
        height={TOTAL_BOARD_HEIGHT}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{
          x: TOTAL_BOARD_WIDTH,
          y: TOTAL_BOARD_HEIGHT,
        }}
        fillLinearGradientColorStops={[
          0,
          "#0b1220",
          0.35,
          "#0f172a",
          0.7,
          "#0b1220",
          1,
          "#0a0f1c",
        ]}
        stroke="black"
        strokeWidth={6}
        cornerRadius={16}
      />
      <Rect
        x={8}
        y={8}
        width={TOTAL_BOARD_WIDTH - 16}
        height={TOTAL_BOARD_HEIGHT - 16}
        stroke="#334155"
        strokeWidth={4}
        cornerRadius={12}
      />

      {[
        { x: 24, y: 24 },
        { x: TOTAL_BOARD_WIDTH - 24, y: 24 },
        { x: 24, y: TOTAL_BOARD_HEIGHT - 24 },
        { x: TOTAL_BOARD_WIDTH - 24, y: TOTAL_BOARD_HEIGHT - 24 },
      ].map((pos, i) => (
        <AnimatedBolt key={i} x={pos.x} y={pos.y} />
      ))}

      <Group x={TOTAL_BOARD_WIDTH / 2} y={16}>
        <Rect
          x={-60}
          y={0}
          width={120}
          height={16}
          fill="#1e293b"
          stroke="black"
          strokeWidth={2}
          cornerRadius={4}
        />
        <Rect x={-50} y={4} width={100} height={8} fill="black" opacity={0.5} />
      </Group>
    </Group>
  );
};

const BoardCanvas: React.FC = () => {
  const {
    board,
    startDrop,
    completeDrop,
    completeRemoteDrop,
    winningCells,
    hoverColumn,
    setHoverColumn,
    gameStatus,
    activeDrop,
    currentPlayer,
    gameMode,
    isMovePending,
  } = useGameStore();

  const { sendMove, isBotGame, isConnected, playerNumber } = useSocketStore();

  const [scale, setScale] = useState(1);
  const stageRef = useRef<Konva.Stage>(null);
  const boardGroupRef = useRef<Konva.Group>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if it is the local player's turn
  // In local mode (isConnected=false), it's always "my turn" (shared device)
  const isMyTurn = !isConnected || currentPlayer === (playerNumber || 1);

  // Disable interactions if:
  // 1. Game not playing
  // 2. Animation active
  // 3. Move pending server response
  // 4. Not my turn
  const interactionDisabled = gameStatus !== "playing" || !!activeDrop || isMovePending || !isMyTurn;

  // Helper for relative coloring
  // If online/bot: Me = Red (Primary), Opponent = Yellow (Secondary)
  // If local: P1 = Red, P2 = Yellow
  const getVisualColor = (playerVal: number) => {
    if (!isConnected) {
      return playerVal === 1 ? "#FF4D4D" : "#FFD700";
    }
    const myPlayerNum = playerNumber || 1;
    return playerVal === myPlayerNum ? "#FF4D4D" : "#FFD700";
  };

  // Avoid unnecessary hover updates while interactions are disabled.
  const setHoverColumnSafe = (colIndex: number | null) => {
    if (interactionDisabled) return;
    setHoverColumn(colIndex);
  };

  useEffect(() => {
    const resizeToContainer = () => {
      const container = containerRef.current;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const safeWidth = Math.max(width - 24, 280);
      const safeHeight = Math.max(height - 24, 280);

      // Smaller nav allowance to maximize board space
      const navAllowance = 100;
      const maxHeight = Math.min(safeHeight, vh - navAllowance);
      const maxWidth = Math.min(safeWidth, vw - 24);

      const scaleX = maxWidth / STAGE_WIDTH;
      const scaleY = maxHeight / STAGE_HEIGHT;
      const rawScale = Math.min(scaleX, scaleY);

      // Viewport-aware max scale based on height too:
      // - Short laptops (vh <= 800): cap at 0.55
      // - Standard laptops (vh <= 900 or vw <= 1440): cap at 0.65
      // - Larger screens: can go up to 0.9
      let maxScale = 0.9;
      if (vh <= 800 || vw <= 1366) {
        maxScale = 0.55;
      } else if (vh <= 900 || vw <= 1440) {
        maxScale = 0.65;
      } else if (vw <= 1920) {
        maxScale = 0.8;
      }

      // Clamp so the board stays legible on phones and doesn't overflow on laptops
      setScale(Math.max(0.3, Math.min(rawScale, maxScale)));
    };

    resizeToContainer();

    const observer = new ResizeObserver(resizeToContainer);
    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener("resize", resizeToContainer);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeToContainer);
    };
  }, []);

  const boardMaskPath = useMemo(() => {
    const r = 16;
    const w = INNER_BOARD_WIDTH;
    const h = INNER_BOARD_HEIGHT;

    let path = `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r
      } ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;

    for (let rIdx = 0; rIdx < ROWS; rIdx++) {
      for (let cIdx = 0; cIdx < COLS; cIdx++) {
        const cx = PADDING + cIdx * CELL_SIZE + CELL_SIZE / 2;
        const cy = PADDING + rIdx * CELL_SIZE + CELL_SIZE / 2;
        path += ` M ${cx} ${cy - HOLE_RADIUS}`;
        path += ` A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 1 0 ${cx} ${cy + HOLE_RADIUS
          }`;
        path += ` A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 1 0 ${cx} ${cy - HOLE_RADIUS
          }`;
      }
    }
    return path;
  }, []);

  const handleInteraction = (colIndex: number) => {
    if (interactionDisabled) return;

    // Use server for PvP or bot games when connected
    if (isConnected && (gameMode === "pvp" || isBotGame)) {
      // Multiplayer or Bot game: send move to server
      sendMove(colIndex);
    } else {
      // Local single player (fallback): handle locally
      startDrop(colIndex);
    }
  };

  const triggerBoardShake = () => {
    if (!boardGroupRef.current) return;
    animate(0, 1, {
      type: "spring",
      stiffness: 500,
      damping: 15,
      onUpdate: (v) => {
        const offset = Math.sin(v * Math.PI * 3) * 6 * (1 - v);
        if (boardGroupRef.current)
          boardGroupRef.current.y(BOARD_Y_OFFSET + offset);
      },
      onComplete: () => {
        if (boardGroupRef.current) boardGroupRef.current.y(BOARD_Y_OFFSET);
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center w-full h-full min-h-[50vh] max-h-[calc(100vh-80px)] max-w-6xl mx-auto p-2 sm:p-3 md:p-4"
    >
      <Stage
        width={STAGE_WIDTH * scale}
        height={STAGE_HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
        ref={stageRef}
        listening={!interactionDisabled}
      >
        <Layer>
          <Group x={0} y={BOARD_Y_OFFSET}>
            <BoardLeg height={TOTAL_BOARD_HEIGHT} side="left" />
          </Group>
          <Group x={TOTAL_BOARD_WIDTH + LEG_WIDTH * 2 - 140} y={BOARD_Y_OFFSET}>
            <BoardLeg height={TOTAL_BOARD_HEIGHT} side="right" />
          </Group>

          <Group x={LEG_WIDTH} y={BOARD_Y_OFFSET} ref={boardGroupRef}>
            <GrandBoardFrame />

            <Group x={FRAME_THICKNESS} y={FRAME_THICKNESS}>
              <Rect
                x={0}
                y={0}
                width={INNER_BOARD_WIDTH}
                height={INNER_BOARD_HEIGHT}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: INNER_BOARD_HEIGHT }}
                fillLinearGradientColorStops={[
                  0,
                  "#0f1f47",
                  0.5,
                  "#1b3672",
                  1,
                  "#0b1530",
                ]}
                cornerRadius={8}
              />

              {hoverColumn !== null &&
                !activeDrop &&
                gameStatus === "playing" && (
                  <Rect
                    x={PADDING + hoverColumn * CELL_SIZE}
                    y={PADDING / 2}
                    width={CELL_SIZE}
                    height={INNER_BOARD_HEIGHT - PADDING}
                    fill="white"
                    opacity={0.08}
                    cornerRadius={8}
                  />
                )}

              {board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  if (cell === null) return null;
                  const isWinning = winningCells.some(
                    (wc) => wc.row === rIdx && wc.col === cIdx
                  );
                  return (
                    <Group
                      key={`static-${rIdx}-${cIdx}`}
                      x={PADDING + cIdx * CELL_SIZE + CELL_SIZE / 2}
                      y={PADDING + rIdx * CELL_SIZE + CELL_SIZE / 2}
                    >
                      <BrutalistDisc
                        color={getVisualColor(cell as 1 | 2)}
                        radius={HOLE_RADIUS - 1}
                        isWinning={isWinning}
                      />
                    </Group>
                  );
                })
              )}

              {activeDrop && (
                <Group x={-FRAME_THICKNESS} y={-FRAME_THICKNESS}>
                  <DroppingDisc
                    drop={activeDrop}
                    color={getVisualColor(activeDrop.player)}
                    onLand={(isConnected && (gameMode === "pvp" || isBotGame)) ? completeRemoteDrop : completeDrop}
                    onImpact={triggerBoardShake}
                  />
                </Group>
              )}

              <Group>
                <Path
                  data={boardMaskPath}
                  x={4}
                  y={4}
                  fill="black"
                  opacity={0.4}
                  fillRule="evenodd"
                />
                <Path
                  data={boardMaskPath}
                  x={0}
                  y={0}
                  fill="#2563EB"
                  fillRule="evenodd"
                  stroke="black"
                  strokeWidth={3}
                />
                <Rect
                  x={PADDING}
                  y={PADDING}
                  width={INNER_BOARD_WIDTH - PADDING * 2}
                  height={4}
                  fill="white"
                  opacity={0.2}
                  cornerRadius={2}
                />
                <Rect
                  x={PADDING}
                  y={INNER_BOARD_HEIGHT - PADDING}
                  width={INNER_BOARD_WIDTH - PADDING * 2}
                  height={4}
                  fill="black"
                  opacity={0.2}
                  cornerRadius={2}
                />
              </Group>
            </Group>

            {hoverColumn !== null &&
              !activeDrop &&
              gameStatus === "playing" && (
                <ColumnArrow
                  colIndex={hoverColumn}
                  player={currentPlayer}
                  color={getVisualColor(currentPlayer)}
                />
              )}

            {Array.from({ length: COLS }).map((_, cIdx) => (
              <Rect
                key={`hit-${cIdx}`}
                x={FRAME_THICKNESS + PADDING + cIdx * CELL_SIZE}
                y={-100}
                width={CELL_SIZE}
                height={TOTAL_BOARD_HEIGHT + 200}
                fill="transparent"
                listening={!interactionDisabled}
                onMouseEnter={() => setHoverColumnSafe(cIdx)}
                onMouseLeave={() => setHoverColumnSafe(null)}
                onClick={() => handleInteraction(cIdx)}
                onTap={() => handleInteraction(cIdx)}
                cursor={!interactionDisabled ? "pointer" : "default"}
              />
            ))}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default BoardCanvas;
