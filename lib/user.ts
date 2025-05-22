import api, { handler } from "./api";

export const fetchProfileData = (name: string) =>
  handler(() => api.get(`user/${name}`));

export const fetchUserData = (name: string) =>
  handler(() => api.get(`user/data/${name}`));

export const fetchPlayersByName = async (name: string) =>
  handler(() => api.get(`user/players/${name}`));

export const fetchUserGames = async (name: string) =>
  handler(() => api.get(`user/${name}/games`));

export const fetchUserFriends = async (name: string) =>
  handler(() => api.get(`user/${name}/friends`));

export const fetchNotifications = async () =>
  handler(() => api.get(`notification`));

export const clearNotifications = async () =>
  handler(() => api.delete(`notification`));

export const unFriend = async (friendId: string) =>
  handler(() => api.delete(`user/friends/${friendId}`));

export const getWallet = async () => handler(() => api.get(`auth/wallet`));
