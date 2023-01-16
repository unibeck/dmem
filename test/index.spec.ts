// import { expect, test } from "vitest";
// import worker from "../src/index";

import {unstable_dev, type UnstableDevWorker} from 'wrangler';
import {describe, expect, it, beforeAll, afterAll} from 'vitest';

async function workerScheduled(worker: UnstableDevWorker, cron?: string) {
    return await worker.fetch(
        `http://${worker.address}:${worker.port}/__scheduled${
            cron ? "?cron=" + cron : ""
        }`
    );
}

describe('Worker', () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev(
            './src/index.ts',
            {experimental: {testScheduled: true, disableExperimentalWarning: true}},
        );
    });

    afterAll(async () => {
        await worker.stop();
    });

    it('should tweet from dm', async () => {
        const resp = await workerScheduled(worker);
        expect(resp.status).toBe(200);

        const text = await resp.text();
        expect(text).toBe('request method: GET');
    });

    //TODO: implement for badge support
    // it('should return 200 response', async () => {
    //     const req = new Request('http://falcon', { method: 'GET' });
    //     const resp = await worker.fetch(req);
    //     expect(resp.status).toBe(200);
    //
    //     const text = await resp.text();
    //     expect(text).toBe('request method: GET');
    // });
});
