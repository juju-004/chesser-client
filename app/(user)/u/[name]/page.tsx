import { CLIENT_URL } from "@/config";
import { fetchUserData } from "@/lib/user";
import { notFound } from "next/navigation";
import Profile from "./Profile";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const data = await fetchUserData(name);
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

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
   const { name } = await params;
   const data = await fetchUserData(name);

  if (!data?.id) notFound();

  return <Profile data={data} />;
}
