import { TwitchUser, TwitchStream } from '../types/twitch'

export function combineStreamerAndStreamData(streams: TwitchStream[], streamers: TwitchUser[]): TwitchStream[] {
  return streams.map((stream: TwitchStream) => {
    const streamer = streamers.find((streamer: TwitchUser) => streamer.id === stream.user_id);

    return {
      ...stream,
      streamerName: streamer?.display_name,
      profileImage: streamer?.profile_image_url,
    };
  })
}
