# dmem
A private "mem it" liaison between your personal Twitter and a bot Twitter account. Send a DM of a tweet you would like 
to "mem" to your Twitter bot account. The bot account will reply to that tweet and mem it. With your bot account 
connected to your mem account, you can now privately mem tweets.

This solves the problem of having to publicly mem a tweet, talked about here https://roadmap.mem.ai/b/feature-requests/option-to-use-mem-it-for-twitter-privately/.

To accomplish this, I employ a Cloudflare worker that runs every five minutes. The worker checks for new DMs from your
personal account to the bot account. If there are new DMs, it will reply to the tweet with the text "mem it". There is
more to it, which I implore you to read in `index.ts`.

## Getting Started

### Prerequisites
All resources used to run this are free, here is what you need:
- Twitter Dev account and API keys
- Cloudflare account and API keys
- `npm` installed on your machine

### Initialisation
```bash
#Install dependencies
npm i

#Create the KV namespaces. Update wrangler.toml with the namespace IDs returned here
wrangler kv:namespace create "DMEM_KV"
wrangler kv:namespace create "DMEM_KV" --preview

wrangler secret put TWITTER_BEARER_TOKEN
```

## Deploying
```bash
wrangler publish --env production
```

## Testing
First, create and fill out a `.dev.vars` file using the `.dev.vars.example` file as a template.

Then, run the following command:
```bash
wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

## TODO:
- [ ] Deploy
- [ ] Improve tests
- [ ] Status page with number of tweets
