import { API_URL } from "@/config";
import { userApi } from "./api/userapi";

export const fetchProfileData = async (name: string) =>
  userApi.get(`${API_URL}/v1/auth/user/${name}`);

export const fetchUserGames = async (name: string) =>
  userApi.get(`${API_URL}/v1/user/${name}/games`);

export const fetchUserFriends = async (name: string) =>
  userApi.get(`${API_URL}/v1/user/${name}/friends`);

export const addFriend = async (friendId: string) =>
  userApi.post(`${API_URL}/v1/user/friend`, { friendId });

export const blockUser = async (userId: string) =>
  userApi.post(`${API_URL}/v1/user/block`, { userId });

export const removeFriend = async (friendId: string) =>
  userApi.del(`${API_URL}/v1/user/friends/${friendId}`);

export const unBlockUser = async (userId: string) =>
  userApi.del(`${API_URL}/v1/user/blocked/${userId}`);

export const getWallet = async () => {
  try {
    const res = await fetch(`${API_URL}/v1/auth/wallet`, {
      credentials: "include",
    });

    if (res && res.status === 200) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.error(err);
  }
};
