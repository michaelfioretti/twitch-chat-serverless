import * as Constants from '../../helpers/constants'

describe('constants', () => {
  it('should return the TWITCH_STREAMS_URL', async () => {
    expect(Constants.TWITCH_STREAMS_URL).toBe('https://api.twitch.tv/helix/streams')
  })

  it('should return the TWITCH_TOKEN_URL', () => {
    expect(Constants.TWITCH_TOKEN_URL).toBe('https://id.twitch.tv/oauth2/token')
  })

  it('should return the TWITCH_SEARCH_URL', () => {
    expect(Constants.TWITCH_SEARCH_URL).toBe('https://api.twitch.tv/helix/search/channels?live_only=true')
  })

  it('should return the TWITCH_USERS_URL', () => {
    expect(Constants.TWITCH_USERS_URL).toBe('https://api.twitch.tv/helix/users')
  })
});
