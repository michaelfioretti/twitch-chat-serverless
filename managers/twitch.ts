import axios from 'axios';
import { TwitchChannel, TwitchStream, Streamer } from '../types/twitch'
import { TWITCH_SEARCH_URL, TWITCH_STREAMER_FETCH_COUNT, TWITCH_STREAMS_URL, TWITCH_TOKEN_URL, TWITCH_USERS_URL } from '../helpers/constants';
import { combineStreamerAndStreamData } from '../helpers/twitch';

class TwitchManager {
  private oauthToken: string | undefined;

  /**
   * Gets the top 100 livestreams on Twitch by viewer count
   *
   * @return  {Promise<TwitchStream>[]} An array of TwitchStreams
   */
  async GetTopTwitchLiveStreams(): Promise<TwitchStream[]> {
    if (!this.oauthToken) {
      await this.GetTwitchToken()
    }

    const streamsResponse = await axios.get(TWITCH_STREAMS_URL, {
      params: { 'first': TWITCH_STREAMER_FETCH_COUNT },
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${this.oauthToken}`,
      },
    });

    const streams = streamsResponse.data.data
    const userIds = streams.map((stream: TwitchStream) => stream.user_id);

    // Now we need to associated the specific Twitch streamers to their
    // livestreams that are currently active
    const streamersResponse = await axios.get(TWITCH_USERS_URL, {
      params: { id: userIds },
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${this.oauthToken}`,
      },
    });

    const streamers = streamersResponse.data.data

    return combineStreamerAndStreamData(streams, streamers)
  }

  async SearchForTwitchChannel(query: string): Promise<TwitchStream[]> {
    if (!this.oauthToken) {
      await this.GetTwitchToken()
    }

    // The search below will return an array of TwitchChannel types. After this, we
    // need to get the associated streamer information like when we fetch the top
    // 100 livestreams
    try {
      const response = await axios.get(TWITCH_SEARCH_URL, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${this.oauthToken}`,
        },
        params: {
          query
        },
      });

      // Now we need to associated the specific Twitch streamers to their
      // livestreams that are currently active.
      //
      // Note: We are specifying "id" on the stream instead of "user_id" since,
      // in this case, the endpoint specifies that the 'id' parameter ties the
      // stream to the broadcaster.
      //
      // Twitch documentation: https://dev.twitch.tv/docs/api/reference/#search-channels
      const streams = response.data.data
      const userIds = streams.map((stream: TwitchStream) => stream.id)
      const streamersResponse = await axios.get(TWITCH_USERS_URL, {
        params: { id: userIds },
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${this.oauthToken}`,
        },
      });

      // @TODO: Clean this up/optimize
      // Note: Same as other code, but currently checking id instead of user_id
      const streamers = streamersResponse.data.data
      return streams.map((stream: TwitchStream) => {
        const streamer = streamers.find((streamer: Streamer) => streamer.id === stream.id);

        return {
          ...stream,
          streamerName: streamer?.display_name,
          profileImage: streamer?.profile_image_url,
        };
      })
    } catch (error) {
      throw error;
    }
  }

  async GetSpecificTwitchLiveStreams(channels: TwitchChannel[]): Promise<TwitchStream[]> {
    if (!this.oauthToken) {
      await this.GetTwitchToken()
    }

    const streamsResponse = await axios.get(TWITCH_STREAMS_URL, {
      params: {
        user_id: channels.map((channel) => channel.id)
      },
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${this.oauthToken}`,
      },
    });

    return streamsResponse.data.data;
  }

  async GetTwitchToken(): Promise<void> {
    const response = await axios.post(TWITCH_TOKEN_URL, {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    })

    this.oauthToken = response.data.access_token;
  };
}

export default TwitchManager
