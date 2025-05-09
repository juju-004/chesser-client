import { ProfileData, User } from "@/types";

type Body = {
  friendId?: string;
  userId?: string;
};

const post = async (url: string, body: Body) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.status === 201) {
      const data: ProfileData = await res.json();
      return data;
    } else if (res.status === 404 || res.status === 401 || res.status === 500) {
      const { message } = await res.json();
      return (message as string) || "Something went wrong";
    }
  } catch (err) {}
};

const get = async (url: string) => {
  try {
    const res = await fetch(url, {
      credentials: "include",
      cache: "no-store",
    });

    if (res && res.status === 200) {
      const data = await res.json();
      return data;
    } else if (res.status === 404 || res.status === 401 || res.status === 500) {
      const { message } = await res.json();
      return (message as string) || "Something went wrong";
    }
  } catch (err) {
    // do nothing
  }
};

const del = async (url: string) => {
  try {
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status === 200) {
      const data: ProfileData = await res.json();
      return data;
    } else if (res.status === 409 || res.status === 500 || res.status === 404) {
      const { message } = await res.json();
      return (message as string) || "Something went wrong";
    }
  } catch (err) {
    console.error(err);
  }
};

export const userApi = {
  post,
  get,
  del,
};
