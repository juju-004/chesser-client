import { PieceSet } from "@/app/preferences/components/Piece";
import { themes } from "@/app/preferences/components/Theme";
import { usePreference } from "@/context/PreferenceProvider";
import { CustomSquares, GameTimer, Lobby } from "@/types";
import { Chess, Move, Square } from "chess.js";
import React, {
  Dispatch,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Chessboard } from "react-chessboard";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { Socket } from "socket.io-client";
import Board, { animationDuration, createLocalPieceSet } from "./Board";

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
  makeMove: (m: {
    from: string | Square;
    to: string | Square;
    promotion: string;
  }) => boolean;
}

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
  const [moveFrom, setMoveFrom] = useState<string | Square | null>(null);
  const [premove, setPremove] = useState<{ from: Square; to: Square }[] | null>(
    null
  );

  const premoveFen = useMemo(() => {
    if (lobby.side === "s") return lobby.actualGame;
    const fenParts = lobby.actualGame.fen().split(" ");
    fenParts[1] = lobby.side; // fake your turn
    const fakeFen = fenParts.join(" ");

    const game = new Chess();
    game.load(fakeFen);
    return game;
  }, [lobby.actualGame.fen(), lobby.side]);

  const preFen = useMemo(() => {
    const game = new Chess();
  }, [premove]);

  // useEffect(() => {
  //   if (premove && lobby.side === lobby.actualGame.turn()) {
  //     const move = makeMove({ ...premove, promotion: "q" });
  //     if (move) {
  //       socket.emit("sendMove", { ...premove, promotion: "q" });
  //     }
  //     setPremove(null); // Clear after attempting
  //   }
  // }, [lobby.actualGame.turn()]);

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
    const mainLobby = isYourTurn ? lobby.actualGame : premoveFen;
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
      lobby.side !== lobby.actualGame.turn() ||
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

  function onSquareClick(square: Square) {
    if (navFen || lobby.endReason || lobby.winner) return;

    const isYourTurn = lobby.side === lobby.actualGame.turn();

    function resetFirstMove(square: Square | null) {
      if (!square) return;
      const piece = lobby.actualGame.get(square);

      const isOwnPiece = piece && piece.color === lobby.side;

      if (
        isOwnPiece &&
        navIndex === null &&
        !lobby.endReason &&
        !lobby.winner
      ) {
        setMoveFrom(square);
        getMoveOptions(square, isYourTurn);
      } else {
        setPremove(null);
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

    const makePremove = () => {
      const legalMoves = premoveFen.moves({
        square: moveFrom as Square,
        verbose: true,
      });

      const isLegal = legalMoves.some(
        (mo) => mo.from === moveFrom && mo.to === square
      );
      return isLegal;
    };
    const move = isYourTurn ? makeMove(moveDetails) : makePremove();

    if (!move) {
      resetFirstMove(square);
      return;
    }
    setMoveFrom(null);
    isYourTurn
      ? socket.emit("sendMove", moveDetails)
      : setPremove(
          premove
            ? [
                ...premove,
                { from: moveDetails.from as Square, to: moveDetails.to },
              ]
            : [{ from: moveDetails.from as Square, to: moveDetails.to }]
        );
  }

  function isDraggablePiece({ piece }: { piece: string }) {
    return piece.startsWith(lobby.side) && !lobby.endReason && !lobby.winner;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    if (lobby.side === "s" || navFen || lobby.endReason || lobby.winner)
      return false;

    const moveDetails = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };

    // Not your turn? Set single premove
    if (lobby.side !== lobby.actualGame.turn()) {
      setPremove(premove ? [...premove, moveDetails] : [moveDetails]); // overwrites old one
      return true;
    }

    const move = makeMove(moveDetails);
    if (!move) return false;

    setPremove(null); // Clear premove just in case
    socket.emit("sendMove", moveDetails);
    return true;
  }

  return (
    <Board isActive clock={clock} lobby={lobby} perspective={perspective}>
      {children}

      {userPreference && (
        <Chessboard
          customDarkSquareStyle={{
            backgroundColor: themes[userPreference?.theme][0],
          }}
          customLightSquareStyle={{
            backgroundColor: themes[userPreference?.theme][1],
          }}
          position={navFen || lobby.actualGame.fen()}
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
          }}
        />
      )}
    </Board>
  );
}
