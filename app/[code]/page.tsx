import GameAuthWrapper from "./components/GameAuthWrapper";
import { fetchActiveGame } from "@/lib/game";
import { notFound } from "next/navigation";
import ArchivedGame from "./components/archive/Game";
import { CLIENT_URL } from "@/config";

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
      title: `${game.white?.name} vs ${game.black?.name} | chesser`,
      description: `Game played between ${game.white?.name}(white) and ${game.black?.name}(black)`,
      type: "website",
      url: `${CLIENT_URL}/${game.code}`,
      openGraph: {
        title: "chesser",
        description: `Game played between ${game.white?.name}(white) and ${game.black?.name}(black)`,
        url: `${CLIENT_URL}/${game.code}`,
        siteName: "chesser",
        locale: "en_US",
        type: "website",
      },
    };
  } else {
    return {
      title: `Challenge from ${game.host?.name} | chesser`,
      description: `${game.timeControl} mins - ₦${game.stake} | Play or watch a game with ${game.host?.name}`,
      type: "website",
      url: `${CLIENT_URL}/${game.code}`,
      openGraph: {
        title: "chesser",
        description: `${game.timeControl} mins - ₦${game.stake} | Play or watch a game with ${game.host?.name}`,
        url: `${CLIENT_URL}/${game.code}`,
        siteName: "chesser",
        locale: "en_US",
        type: "website",
      },
    };
  }
}

export default async function Game({ params }: { params: { code: string } }) {
  const game = await fetchActiveGame(params.code);

  if (!game) notFound();

  return game.endReason ? (
    <ArchivedGame game={game} chatDot={game.chat?.length ? true : false} />
  ) : (
    <GameAuthWrapper initialLobby={game} />
  );
}
