import {TwitterApi} from 'twitter-api-v2';
import {DMEventV2} from "twitter-api-v2/dist/cjs/types/v2/dm.v2.types";

export interface Env {
    //Clouflare KV
    DMEM_KV: KVNamespace

    //Environment variables
    MEM_IT_SIGNATURE: string
    LAST_KNOWN_DM_DATE_KEY: string
    USERNAME: string

    //Secrets
    TWITTER_BEARER_TOKEN: string
}

async function tweetMemIt(env: Env, twitterClient: TwitterApi, dm: DMEventV2) {
    if (dm.referenced_tweets) {
        for (const referencedTweet of dm.referenced_tweets) {
            const response = await twitterClient.v2.reply(env.MEM_IT_SIGNATURE, referencedTweet.id)
            //TODO: return success/failure
        }
    }
}

async function respondToDMs(event: Event, env: Env) {
    const twitterClient = new TwitterApi(env.TWITTER_BEARER_TOKEN);

    //Get participant id from twitter handle
    const user = await twitterClient.v2.userByUsername(env.USERNAME)
    const participantId = user.data.id
    console.log("participantId", participantId)

    //Get the latest DMs and sort them
    const dms = await twitterClient.v2.listDmEventsWithParticipant(participantId, {max_results: 10});
    console.dir(dms);
    const sortedDMs = dms.events
        .filter(dm => dm.created_at !== undefined)
        .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())

    //Process the DMs which we haven't seen before
    const lastKnownDMDateVal = await env.DMEM_KV.get(env.LAST_KNOWN_DM_DATE_KEY)
    const lastKnownDMDate = lastKnownDMDateVal ? new Date(lastKnownDMDateVal) : new Date(0)
    let unknownDMs = 0
    let successfulMemTweets = 0
    let newestDMDate
    for (const dm of sortedDMs) {
        const dmDate = new Date(dm.created_at!)
        if (dmDate > lastKnownDMDate) {
            unknownDMs++
            await tweetMemIt(env, twitterClient, dm)
            successfulMemTweets++
            newestDMDate = dmDate
        }
    }
    console.log("sortedDMs.length", sortedDMs.length)
    console.log("unknownDMs", unknownDMs)
    console.log("successfulMemTweets", successfulMemTweets)

    //Post process based on successfulness
    if (newestDMDate) {
        await env.DMEM_KV.put(env.LAST_KNOWN_DM_DATE_KEY, newestDMDate.toISOString())
    }
    if (unknownDMs > 0) {
        await twitterClient.v2.sendDmToParticipant(Number(participantId), { text: `I mem'd ${successfulMemTweets} of ${unknownDMs} new DMs!`})
    }
}

const worker = {
    async scheduled(event: Event, env: Env, ctx: ExecutionContext) {
        ctx.waitUntil(respondToDMs(event, env));
    },
}

export default worker;
