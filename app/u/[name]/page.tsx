"use client";

import { fetchProfileData } from "@/lib/user";
import { useEffect, useState } from "react";
import Profile from "./Profile";
import { notFound } from "next/navigation";

export default function Pro({ params }: { params: { name: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const profileData = await fetchProfileData(params.name);
      if (!profileData) {
        notFound();
      } else {
        setData(profileData);
      }
      setLoading(false);
    };

    loadData();
  }, [params.name]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Profile data={data} />;
}
