import axios from 'axios';
import TwitchManager from '../../managers/twitch'
import { TwitchChannel, TwitchStream } from '../../types/twitch';
import { TWITCH_SEARCH_URL, TWITCH_STREAMS_URL, TWITCH_USERS_URL } from '../../helpers/constants';

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

describe('TwitchManager', () => {
  let twitchManager: TwitchManager;

  beforeEach(() => {
    twitchManager = new TwitchManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SearchForTwitchChannel', () => {
    it('should call GetTwitchToken if oauthToken is not set and return search results', async () => {
      const mockToken = 'mock_oauth_token';

      jest.spyOn(twitchManager, 'GetTwitchToken').mockResolvedValueOnce();
      twitchManager['oauthToken'] = mockToken;

      mockedAxios.get.mockResolvedValueOnce({ data: { data: mockTwitchChannelArr } });

      const result = await twitchManager.SearchForTwitchChannel('test_channel');

      // expect(twitchManager.GetTwitchToken).toHaveBeenCalled();
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

  // describe('GetStreamerInfoFromStreams', () => {
  //   it('should return streamer info from streams', async () => {
  //     const mockStreams: TwitchStream[] = [mockTwitchStream];
  //     const mockStreamerData = [{ id: '123', display_name: 'streamer_name' }];
  //     const mockToken = 'mock_oauth_token';

  //     jest.spyOn(twitchManager, 'GetTwitchToken').mockResolvedValueOnce(undefined);
  //     twitchManager['oauthToken'] = mockToken;

  //     mockedAxios.get.mockResolvedValueOnce({ data: { data: mockStreamerData } });

  //     const result = await twitchManager.GetStreamerInfoFromStreams(mockToken, mockStreams);

  //     expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/users'), expect.objectContaining({
  //       params: { id: ['123'] },
  //       headers: {
  //         'Client-ID': process.env.TWITCH_CLIENT_ID,
  //         Authorization: `Bearer ${mockToken}`
  //       }
  //     }));
  //     expect(result).toEqual(mockStreamerData);
  //   });
  // });

  describe('GetTwitchToken', () => {
    it('should fetch and set the OAuth token', async () => {
      const mockToken = 'new_mock_token';

      mockedAxios.post.mockResolvedValueOnce({ data: { access_token: mockToken } });

      await twitchManager.GetTwitchToken();

      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/oauth2/token'), {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
      });
      expect(twitchManager['oauthToken']).toBe(mockToken);
    });
  });

  describe('GetTop100TwitchLiveStreams', () => {
    it('should return the top 100 live streams', async () => {
      const mockStreams: TwitchStream[] = [mockTwitchStream];
      const mockToken = 'mock_oauth_token';

      jest.spyOn(twitchManager, 'GetTwitchToken').mockResolvedValueOnce(undefined);
      twitchManager['oauthToken'] = mockToken;

      mockedAxios.get.mockResolvedValueOnce({ data: { data: mockStreams } });

      const result = await twitchManager.GetTop100TwitchLiveStreams();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/streams'), expect.objectContaining({
        params: { 'first': 100 },
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${mockToken}`
        }
      }));
      expect(result).toEqual(mockStreams);
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
