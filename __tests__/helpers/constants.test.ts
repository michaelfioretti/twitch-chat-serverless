import * as Constants from '../../helpers/constants'

describe('constants', () => {
  it('should return the TWITCH_BASE_URL', async () => {
    expect(Constants.TWITCH_BASE_URL).toBe('https://api.twitch.tv/helix')
  })

  it('should return the TWITCH_TOKEN_URL', () => {
    expect(Constants.TWITCH_TOKEN_URL).toBe('https://id.twitch.tv/oauth2/token')
  })

  it('should return the TWITCH_SEARCH_URL', () => {
    expect(Constants.TWITCH_SEARCH_URL).toBe('https://api.twitch.tv/helix/search/channels?live_only=true')
  })
});
