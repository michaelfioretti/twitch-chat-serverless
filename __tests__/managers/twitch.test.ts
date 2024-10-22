import axios from 'axios';
import TwitchManager from '../../managers/twitch'
import { Streamer, TwitchChannel, TwitchStream } from '../../types/twitch';
import { TWITCH_SEARCH_URL, TWITCH_STREAMER_FETCH_COUNT, TWITCH_STREAMS_URL, TWITCH_TOKEN_URL, TWITCH_USERS_URL } from '../../helpers/constants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockTwitchChannelArr: TwitchChannel[] = [{
  broadcaster_language: 'broadcaster_language',
  broadcaster_login: 'broadcaster_login',
  display_name: 'display_name',
  game_id: 'game_id',
  game_name: 'game_name',
  id: 'id',
  is_live: true,
  tag_ids: ['tag_ids_1', 'tag_ids_2'],
  tags: ['tags_1', 'tags_2'],
  thumbnail_url: 'thumbnail_url',
  title: 'title',
  started_at: 'started_at',
}]

const mockTwitchStream: TwitchStream = {
  game_id: 'game_id',
  game_name: 'game_name',
  id: 'id',
  is_mature: false,
  language: 'english',
  profileImage: 'https://profileimg',
  started_at: 'started_at',
  streamerName: 'streamer_123',
  tag_ids: ['tag_ids_1', 'tag_ids_2'],
  tags: ['tags_1', 'tags_2'],
  thumbnail_url: 'thumbnail_url',
  title: 'title',
  type: 'type',
  user_id: 'user_id',
  user_login: 'user_login',
  user_name: 'user_name',
  viewer_count: 12345
}

const mockTwitchStreamer: Streamer = {
  id: 'user_id',
  display_name: 'display_name',
  profile_image_url: 'profile_image_url',
  description: 'description',
}

describe('TwitchManager', () => {
  let twitchManager: TwitchManager;

  beforeEach(() => {
    twitchManager = new TwitchManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SearchForTwitchChannel', () => {
    it('should return search results', async () => {
      const mockToken = 'mock_oauth_token';

      jest.spyOn(twitchManager, 'GetTwitchToken').mockResolvedValue();
      twitchManager['oauthToken'] = mockToken;

      mockedAxios.get.mockResolvedValueOnce({ data: { data: mockTwitchChannelArr } });

      const result = await twitchManager.SearchForTwitchChannel('test_channel');

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${mockToken}`,
        },
        params: { query: 'test_channel' }
      }));

      expect(result).toEqual(mockTwitchChannelArr);
    });

    it('should throw an error if the API call fails', async () => {
      jest.spyOn(twitchManager, 'GetTwitchToken').mockResolvedValueOnce(undefined);
      twitchManager['oauthToken'] = 'mock_oauth_token';

      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(twitchManager.SearchForTwitchChannel('test_channel')).rejects.toThrow('API Error');
    });
  });

  describe('GetTwitchToken', () => {
    it('should fetch and set the OAuth token', async () => {
      const mockToken = 'new_mock_token';

      mockedAxios.post.mockResolvedValueOnce({ data: { access_token: mockToken } });

      await twitchManager.GetTwitchToken();

      expect(mockedAxios.post).toHaveBeenCalledWith(TWITCH_TOKEN_URL, {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      });
      expect(twitchManager['oauthToken']).toBe(mockToken);
    });
  });

  describe('GetTopTwitchLiveStreams', () => {
    it('should return the top 100 live streams', async () => {
      // Since we are fetching data about each streamer from their associated
      // livestream, we will need to mock both a TwitchStream[] as well as
      // a Streamer[]
      const mockStreams: TwitchStream[] = [mockTwitchStream];
      const mockStreamers: Streamer[] = [mockTwitchStreamer]
      const mockToken = 'mock_oauth_token';

      jest.spyOn(twitchManager, 'GetTwitchToken').mockResolvedValueOnce(undefined);
      twitchManager['oauthToken'] = mockToken;

      mockedAxios.get.mockResolvedValueOnce({ data: { data: mockStreams } })
        .mockResolvedValue({ data: { data: mockStreamers } })

      const result = await twitchManager.GetTopTwitchLiveStreams();

      expect(mockedAxios.get).toHaveBeenNthCalledWith(1, TWITCH_STREAMS_URL, {
        params: { 'first': TWITCH_STREAMER_FETCH_COUNT },
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${mockToken}`
        }
      })

      const ids = mockStreams.map((stream) => stream.user_id)

      expect(mockedAxios.get).toHaveBeenNthCalledWith(2, TWITCH_USERS_URL, {
        params: { id: ids },
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${mockToken}`
        }
      })

      // Here we will add the "fetched" Twitch channel's profileImage and streamerName
      // to the mock streams fetched before checking for the expected result
      const expectedResult = [{
        ...mockTwitchStream,
        streamerName: mockTwitchStreamer.display_name,
        profileImage: mockTwitchStreamer.profile_image_url
      }]

      expect(result).toEqual(expectedResult);
    });
  });

  describe('GetSpecificTwitchLiveStreams', () => {
    it('should return specific channels based on user ids passed in', async () => {
      const mockChannels: TwitchChannel[] = mockTwitchChannelArr
      const mockStreams: TwitchStream[] = [mockTwitchStream];
      const mockToken = 'mock_oauth_token';

      jest.spyOn(twitchManager, 'GetTwitchToken').mockResolvedValueOnce(undefined);
      twitchManager['oauthToken'] = mockToken;

      mockedAxios.get.mockResolvedValueOnce({ data: { data: mockStreams } });

      const result = await twitchManager.GetSpecificTwitchLiveStreams(mockChannels);

      const expectedIds = mockChannels.map((stream) => stream.id)

      expect(mockedAxios.get).toHaveBeenCalledWith(TWITCH_STREAMS_URL, {
        params: { user_id: expectedIds },
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${mockToken}`
        }
      });

      expect(result).toEqual(mockStreams);
    });
  });
});
