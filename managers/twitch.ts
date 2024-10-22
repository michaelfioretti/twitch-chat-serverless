import axios from 'axios';
import { TwitchChannel, TwitchStream } from '../types/twitch'
import { TWITCH_BASE_URL, TWITCH_SEARCH_URL, TWITCH_STREAMS_URL, TWITCH_TOKEN_URL } from '../helpers/constants';

class TwitchManager {
  private oauthToken: string | undefined;

  async SearchForTwitchChannel(query: string): Promise<TwitchChannel[]> {
    if (!this.oauthToken) {
      await this.GetTwitchToken()
    }

    try {
      const response = await axios.get(TWITCH_SEARCH_URL, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${this.oauthToken}`,
        },
        params: {
          query: query,
        },
      });

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async GetStreamerInfoFromStreams(streams: TwitchStream[]) {
    if (!this.oauthToken) {
      await this.GetTwitchToken()
    }

    const userIds = streams.map((stream: TwitchStream) => stream.user_id);
    const streamersResponse = await axios.get(TWITCH_SEARCH_URL, {
      params: { id: userIds },
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${this.oauthToken}`,
      },
    });

    return streamersResponse.data.data
  }

  async GetTwitchToken(): Promise<void> {
    const response = await axios.post(TWITCH_TOKEN_URL, {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    })

    this.oauthToken = response.data.access_token;
  };

  async GetTop100TwitchLiveStreams(): Promise<TwitchStream[]> {
    if (!this.oauthToken) {
      await this.GetTwitchToken()
    }

    const streamsResponse = await axios.get(TWITCH_STREAMS_URL, {
      params: { 'first': 100 },
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${this.oauthToken}`,
      },
    });

    return streamsResponse.data.data;
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
}

export default TwitchManager
