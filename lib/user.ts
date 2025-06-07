import { Preference } from "@/context/PreferenceProvider";
import api, { handler } from "./api";

export const fetchUserData = (name: string) =>
  handler(() => api.get(`user/${name}`));

export const fetchPlayersByName = async (name: string) =>
  handler(() => api.get(`user/${name}/players`));

export const fetchUserGames = async (name: string, page: number) =>
  handler(() => api.get(`user/${name}/games/${page}`));

export const getWallet = async () => handler(() => api.get(`auth/wallet`));

// Notifications
export const fetchNotifications = async () =>
  handler(() => api.get(`notification`));

export const clearNotifications = async () =>
  handler(() => api.delete(`notification`));

// Friends
export const unFriend = async (friendId: string) =>
  handler(() => api.delete(`friends/${friendId}`));

export const fetchUserFriends = async (id: string) =>
  handler(() => api.get(`friends/${id}`));

// Preferences

export const fetchPref = async () => handler(() => api.get(`preference`));

export const updatePref = async (data: Preference) =>
  handler(() => api.patch(`preference`, data));
