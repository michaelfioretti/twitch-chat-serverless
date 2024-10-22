import serverless from "serverless-http";
import express, { Request, Response } from "express";
import TwitchManager from "./managers/twitch";

const app = express();
const twitchManager = new TwitchManager()

app.get("/livestreams", async (_req: Request, res: Response) => {
  const results = await twitchManager.GetTop100TwitchLiveStreams()
  res.json({ results })
})

app.post('/search', async (req: Request, res: Response) => {
  if (!req.body.query) {
    res.status(400).send({
      message: 'Missing body parameter "query"'
    })

    return
  }

  const results = await twitchManager.SearchForTwitchChannel(req.body.query)
  res.json({ results })
})

export const handler = serverless(app);
