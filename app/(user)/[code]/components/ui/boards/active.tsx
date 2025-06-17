"use client";

import { themes } from "@/app/preferences/components/Theme";
import { usePreference } from "@/context/PreferenceProvider";
import { CustomSquares, GameTimer, Lobby } from "@/types";
import { Chess, Move, Square } from "chess.js";
import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Chessboard, ClearPremoves } from "react-chessboard";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { Socket } from "socket.io-client";
import Board, { animationDuration, createLocalPieceSet } from "./Board";

type Pice = {
  wP: ReactElement;
  wN: ReactElement;
  wB: ReactElement;
  wR: ReactElement;
  wQ: ReactElement;
  wK: ReactElement;
  bP: ReactElement;
  bN: ReactElement;
  bB: ReactElement;
  bR: ReactElement;
  bQ: ReactElement;
  bK: ReactElement;
};

interface ActiveBoardProps {
  lobby: Lobby;
  navFen: string | null;
  perspective: BoardOrientation;
  navIndex: number | null;
  clock: Partial<GameTimer>;
  socket: Socket;
  customSquares: CustomSquares;
  children: ReactNode;
  updateCustomSquares: Dispatch<Partial<CustomSquares>>;
  makeMove: (m: { from: Square; to: Square; promotion?: string }) => boolean;
}

const getFakeFen = (lobby: Lobby, side: BoardOrientation) => {
  const fenParts = lobby.actualGame.fen().split(" ");
  fenParts[1] = side[0]; // Fake your turn
  const fakeFen = fenParts.join(" ");

  const game = new Chess();
  game.load(fakeFen);

  return game;
};

export default function ActiveBoard({
  lobby,
  children,
  navIndex,
  customSquares,
  navFen,
  socket,
  perspective,
  makeMove,
  updateCustomSquares,
  clock,
}: ActiveBoardProps) {
  const { userPreference } = usePreference();
  const pieces = userPreference && createLocalPieceSet(userPreference.pieceset);

  // Premove logic
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [premove, setPremove] = useState<
    { from: Square; to: Square; promotion?: string }[]
  >([]);

  const premoveFen = useMemo(() => {
    if (!lobby.side) return;

    // Force turn to user
    const fenParts = lobby.actualGame.fen().split(" ");
    fenParts[1] = lobby.side[0];
    const fakeFen = fenParts.join(" ");

    const game = new Chess();
    game.load(fakeFen);

    for (const move of premove) {
      const piece = game.get(move.from);
      if (!piece || piece.color !== lobby.side[0]) break;

      game.remove(move.to); // remove any piece at destination
      game.remove(move.from); // remove from current square
      game.put(piece, move.to); // place at destination
    }

    return game; // Return final FEN
  }, [lobby.actualGame.fen(), lobby.side, premove]);

  useEffect(() => {
    if (!lobby.side || !premove.length) return;

    if (lobby.side[0] === lobby.actualGame.turn()) {
      const [nextMove, ...rest] = premove;

      const move = makeMove({ ...nextMove });
      if (move) {
        setPremove(rest);
        socket.emit("sendMove", { ...nextMove });
        return;
      }
      setPremove([]); // Clear after attempting
    }
  }, [lobby.actualGame.turn()]);

  // Normal game logic

  function getNavMoveSquares() {
    if (navIndex === null) return;
    const history = lobby.actualGame.history({ verbose: true });

    if (!history.length) return;

    const activeNavMove = document.getElementById("activeNavMove");
    document
      .getElementById("movelist")
      ?.scrollTo(
        (activeNavMove?.offsetLeft as number) - window.innerWidth / 2 + 22,
        0
      );

    return {
      [history[navIndex].from]: { background: "rgba(255, 255, 0, 0.4)" },
      [history[navIndex].to]: { background: "rgba(255, 255, 0, 0.4)" },
    };
  }

  function getMoveOptions(square: Square, isYourTurn?: boolean) {
    const mainLobby = isYourTurn
      ? lobby.actualGame
      : premoveFen || lobby.actualGame;
    const moves = mainLobby.moves({
      square,
      verbose: true,
    }) as Move[];
    if (moves.length === 0) {
      return;
    }

    const newSquares: {
      [square: string]: { background: string; borderRadius?: string };
    } = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          lobby.actualGame.get(move.to as Square) &&
          lobby.actualGame.get(move.to as Square)?.color !==
            lobby.actualGame.get(square)?.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    updateCustomSquares({ options: newSquares });
  }

  function onPieceDragBegin(_piece: string, sourceSquare: Square) {
    if (
      (lobby.side && lobby.side[0] !== lobby.actualGame.turn()) ||
      navFen ||
      lobby.endReason ||
      lobby.winner
    )
      return;

    getMoveOptions(sourceSquare);
  }

  function onPieceDragEnd() {
    updateCustomSquares({ options: {} });
  }

  function makePremove(m: { from: string; to: string; promotion?: string }) {
    const fileToIndex = (f: string) => f.charCodeAt(0) - "a".charCodeAt(0);
    const rankToIndex = (r: string) => parseInt(r, 10) - 1;

    if (!premoveFen) return false;
    const piece = premoveFen.get(moveFrom as Square);
    if (!piece) return false;

    // Normalize positions
    const [fFile, fRank] = m.from!;
    const [tFile, tRank] = m.to!;
    const from = { x: fileToIndex(fFile), y: rankToIndex(fRank) };
    const to = { x: fileToIndex(tFile), y: rankToIndex(tRank) };

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    switch (piece.type) {
      case "p": {
        const forward = piece.color === "w" ? 1 : -1;

        // Forward move (1 or 2 squares from base rank)
        if (
          dx === 0 &&
          (dy === forward ||
            (dy === 2 * forward && (fRank === "2" || fRank === "7")))
        ) {
          return true;
        }

        // Diagonal capture
        if (Math.abs(dx) === 1 && dy === forward) {
          return true;
        }

        return false;
      }

      case "n": {
        // Knight L-shape
        const valid =
          (Math.abs(dx) === 1 && Math.abs(dy) === 2) ||
          (Math.abs(dx) === 2 && Math.abs(dy) === 1);
        return valid;
      }

      case "b": {
        return Math.abs(dx) === Math.abs(dy);
      }

      case "r": {
        return dx === 0 || dy === 0;
      }

      case "q": {
        return dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
      }

      case "k": {
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
      }

      default:
        return false;
    }
  }

  function onSquareClick(square: Square) {
    if (navFen || lobby.endReason || lobby.winner || !lobby.side) return;

    const isYourTurn = lobby.side[0] === lobby.actualGame.turn();

    function resetFirstMove(square: Square | null) {
      if (!square || !lobby.side) return;
      const piece = isYourTurn
        ? lobby.actualGame.get(square)
        : premoveFen?.get(square);

      const isOwnPiece = piece && piece.color === lobby.side[0];

      if (
        isOwnPiece &&
        navIndex === null &&
        !lobby.endReason &&
        !lobby.winner
      ) {
        setMoveFrom(square);
        getMoveOptions(square, isYourTurn);
      } else {
        setPremove([]);
        updateCustomSquares({ options: {} });
      }
    }

    // First click
    if (moveFrom === null) {
      resetFirstMove(square);
      return;
    }

    const moveDetails = {
      from: moveFrom,
      to: square,
      promotion: "q",
    };

    const move = isYourTurn ? makeMove(moveDetails) : makePremove(moveDetails);

    if (!move) {
      resetFirstMove(square);
      return;
    }
    setMoveFrom(null);
    isYourTurn
      ? socket.emit("sendMove", moveDetails)
      : setPremove((prev) => [
          ...prev,
          { from: moveDetails.from as Square, to: moveDetails.to },
        ]);
  }

  function isDraggablePiece({ piece }: { piece: string }) {
    if (!lobby.side) return false;
    return piece.startsWith(lobby.side[0]) && !lobby.endReason && !lobby.winner;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    if (!lobby.side || navFen || lobby.endReason || lobby.winner) return false;

    const moveDetails = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };

    // Not your turn? Set single premove
    if (lobby.side[0] !== lobby.actualGame.turn()) {
      const prem = makePremove(moveDetails);

      if (premove)
        setPremove((prev) => [
          ...prev,
          { from: moveDetails.from as Square, to: moveDetails.to },
        ]);
      return prem;
    }

    const move = makeMove(moveDetails);
    if (!move) return false;

    setPremove([]); // Clear premove just in case
    socket.emit("sendMove", moveDetails);
    return true;
  }
  // dark rgb(164, 35, 35)
  // light rgb(189, 40, 40);
  return (
    <Board
      isActive
      navFen={navFen}
      clock={clock}
      lobby={lobby}
      perspective={perspective}
    >
      {children}

      {userPreference && (
        <Chessboard
          customDarkSquareStyle={{
            backgroundColor: themes[userPreference?.theme][1],
          }}
          customLightSquareStyle={{
            backgroundColor: themes[userPreference?.theme][0],
          }}
          position={
            navFen ||
            (premove.length && premoveFen?.fen()) ||
            lobby.actualGame.fen()
          }
          boardOrientation={perspective}
          isDraggablePiece={isDraggablePiece}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          animationDuration={animationDuration(lobby.timeControl)}
          customPieces={pieces}
          customSquareStyles={{
            ...(navIndex === null
              ? customSquares.lastMove
              : getNavMoveSquares()),
            ...(navIndex === null ? customSquares.options : {}),
            ...(premove.length
              ? Object.fromEntries(
                  premove.flatMap((m) => [
                    [m.from, { backgroundColor: "rgba(255, 55, 0, 0.6)" }],
                    [m.to, { backgroundColor: "rgba(255, 55, 0, 0.6)" }],
                  ])
                )
              : {
                  ...(navIndex === null ? customSquares.check : {}),
                }),
          }}
        />
      )}
    </Board>
  );
}
