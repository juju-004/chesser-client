import GameAuthWrapper from "./components/GameAuthWrapper";
import { fetchActiveGame } from "@/lib/game";
import { notFound } from "next/navigation";
import ArchivedGame from "./components/archive/Game";

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}) {
  const game = await fetchActiveGame(params.code);
  if (!game) {
    return {
      description: "Game not found",
      robots: {
        index: false,
        follow: false,
        nocache: true,
        noarchive: true,
      },
    };
  }

  if (game.endReason) {
    return {
      description: `Play chess Online`,
      openGraph: {
        title: "chesser",
        description: `Play or watch a game with ${game.host?.name}`,
        url: `https://chesser/${game.code}`,
        siteName: "chesser",
        locale: "en_US",
        type: "website",
      },
      robots: {
        index: false,
        follow: false,
        nocache: true,
        noarchive: true,
      },
    };
  } else {
    return {
      description: `Play or watch a game with ${game.host?.name}`,
      openGraph: {
        title: "chesser",
        description: `Play or watch a game with ${game.host?.name} | ${game.timeControl} mins - ₦${game.stake}`,
        url: `https://chesser/${game.code}`,
        siteName: "chesser",
        locale: "en_US",
        type: "website",
      },
      robots: {
        index: false,
        follow: false,
        nocache: true,
        noarchive: true,
      },
    };
  }
}

export default async function Game({ params }: { params: { code: string } }) {
  const game = await fetchActiveGame(params.code);

  if (!game) {
    notFound();
  }

  return game.endReason ? (
    <ArchivedGame game={game} />
  ) : (
    <GameAuthWrapper initialLobby={game} />
  );
}
