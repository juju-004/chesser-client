import { CLIENT_URL } from "@/config";
import { fetchProfileData } from "@/lib/user";
import { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: { name: string };
}) {
  const data = await fetchProfileData(params.name);
  if (!data) {
    return {
      description: "User not found",
      robots: {
        index: false,
        follow: false,
        nocache: true,
        noarchive: true,
      },
    };
  }
  return {
    title: `${data.name} | chesser`,
    description: `${data.name}'s profile`,
    openGraph: {
      title: `${data.name} | chesser`,
      description: `${data.name}'s profile on chesser`,
      url: `${CLIENT_URL}/u/${data.name}`,
      siteName: "chesser",
      locale: "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: false,
      nocache: true,
    },
  };
}

export default async function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
