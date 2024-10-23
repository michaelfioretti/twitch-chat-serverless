export interface TwitchStream {
  game_id: string,
  game_name: string,
  id: string,
  is_mature: boolean,
  language: string,
  profileImage: string | undefined,
  started_at: string,
  streamerName: string | undefined,
  tag_ids: string[],
  tags: string[],
  thumbnail_url: string,
  title: string,
  type: string,
  user_id: string,
  user_login: string,
  user_name: string,
  viewer_count: number
}

export interface TwitchChannel {
  broadcaster_language: string,
  broadcaster_login: string,
  display_name: string,
  game_id: string,
  game_name: string,
  id: string,
  is_live: boolean,
  tag_ids: string[],
  tags: string[],
  thumbnail_url: string,
  title: string,
  started_at: string,
}

export interface TwitchUser {
  id: string;
  display_name: string;
  profile_image_url: string;
  description: string;
}
