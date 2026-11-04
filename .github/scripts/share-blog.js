// Publishes one post from data/blogs.json to one social platform through Buffer,
// and records it in data/social-posts.json so the admin panel can show it and it is not posted twice.
const { existsSync, readFileSync, writeFileSync } = require('fs');

const SITE = 'https://patiot.in';
const API = 'https://api.buffer.com';
const STATE_FILE = 'data/social-posts.json';
const SERVICES = ['linkedin', 'facebook', 'instagram'];
const SITE_WAIT_MS = 10 * 60 * 1000;
const PUBLISH_WAIT_MS = 5 * 60 * 1000;
const POLL_MS = 15 * 1000;

const { BUFFER_API_KEY, SLUG, PLATFORM, DRY_RUN } = process.env;
const dryRun = DRY_RUN === 'true';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function buffer(query, variables) {
    const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${BUFFER_API_KEY}` },
        body: JSON.stringify({ query, variables })
    });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch (e) { throw new Error(`Buffer returned ${res.status}: ${text.slice(0, 200)}`); }
    if (body.errors) throw new Error('Buffer: ' + body.errors.map(e => e.message).join('; '));
    if (!res.ok) throw new Error(`Buffer returned ${res.status}`);
    return body.data;
}

function findPost() {
    const { posts } = JSON.parse(readFileSync('data/blogs.json', 'utf8'));
    const post = SLUG ? posts.find(p => p.slug === SLUG) : dryRun && posts[0];
    if (!post) throw new Error(SLUG ? `No post with slug "${SLUG}"` : 'Choose a post: a real run needs a slug');
    return post;
}

async function findChannel(service) {
    const { account } = await buffer('query { account { organizations { id name } } }');
    const channels = [];
    for (const org of account.organizations) {
        const data = await buffer(
            'query ($input: ChannelsInput!) { channels(input: $input) { id name service type isLocked isDisconnected } }',
            { input: { organizationId: org.id } }
        );
        channels.push(...data.channels.filter(c => c.service === service));
    }
    if (channels.length !== 1) {
        throw new Error(`Expected one ${service} channel in Buffer, found ${channels.length}: ${channels.map(c => c.name).join(', ') || 'none'}`);
    }
    const [channel] = channels;
    if (channel.isLocked || channel.isDisconnected) throw new Error(`${channel.name} is locked or disconnected in Buffer`);
    if (service !== 'instagram' && channel.type === 'profile') throw new Error(`${channel.name} is a personal profile, connect the company page`);
    return channel;
}

// Buffer fetches the image when publishing, so the site must have deployed it first
async function waitForSite(post, imageUrl) {
    const deadline = Date.now() + SITE_WAIT_MS;
    for (;;) {
        const [data, image] = await Promise.all([
            fetch(`${SITE}/data/blogs.json?t=${Date.now()}`).then(r => r.ok ? r.text() : '').catch(() => ''),
            fetch(`${imageUrl}?t=${Date.now()}`, { method: 'HEAD' }).then(r => r.ok).catch(() => false)
        ]);
        if (data.includes(`"${post.slug}"`) && image) return;
        if (Date.now() > deadline) throw new Error(`${post.slug} or its image is not live on ${SITE} after 10 minutes`);
        await sleep(POLL_MS);
    }
}

// Same wording as socialCaption() in blog-admin.html
function caption(post, service, url) {
    // Instagram captions cannot hold a clickable link
    const link = service === 'instagram' ? 'Read the full post on our blog at patiot.in' : `Read more: ${url}`;
    return [post.title, post.excerpt, link].filter(Boolean).join('\n\n');
}

function record(post, service, url) {
    const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : {};
    state[post.id] = { ...state[post.id], [service]: { url, title: post.title, excerpt: post.excerpt } };
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

function alreadyPosted(post, service) {
    if (!existsSync(STATE_FILE)) return false;
    return Boolean(JSON.parse(readFileSync(STATE_FILE, 'utf8'))[post.id]?.[service]);
}

async function publish(post, service) {
    const channel = await findChannel(service);
    const url = `${SITE}/blog-post.html?slug=${encodeURIComponent(post.slug)}`;
    const imageUrl = new URL(post.image, SITE + '/').href;
    const text = caption(post, service, url);
    await waitForSite(post, imageUrl);

    if (dryRun) {
        console.log(`DRY RUN, nothing published. ${service} channel: ${channel.name} (${channel.type})\nImage: ${imageUrl}\n---\n${text}\n---`);
        return;
    }

    const metadata = {
        instagram: { instagram: { type: 'post', shouldShareToFeed: true } },
        facebook: { facebook: { type: 'post' } }
    }[service];
    const { createPost } = await buffer(
        `mutation ($input: CreatePostInput!) {
            createPost(input: $input) {
                ... on PostActionSuccess { post { id schedulingType } }
                ... on MutationError { message }
            }
        }`,
        { input: {
            text,
            channelId: channel.id,
            schedulingType: 'automatic',
            mode: 'shareNow',
            assets: [{ image: { url: imageUrl, metadata: { altText: post.title } } }],
            ...(metadata ? { metadata } : {})
        } }
    );
    if (!createPost.post) throw new Error(createPost.message || 'Buffer did not accept the post');
    if (createPost.post.schedulingType === 'notification') {
        record(post, service, null);
        throw new Error('Buffer turned this into a manual reminder, usually because the image shape is outside 3:4 to 1.91:1. Finish it in Buffer.');
    }

    // Accepted is not published: the platform can still reject it
    const deadline = Date.now() + PUBLISH_WAIT_MS;
    for (;;) {
        const { post: sent } = await buffer(
            'query ($input: PostInput!) { post(input: $input) { status externalLink error { message } } }',
            { input: { id: createPost.post.id } }
        );
        if (sent.status === 'sent') {
            record(post, service, sent.externalLink || null);
            console.log(`Published "${post.title}" to ${channel.name}: ${sent.externalLink || 'no link returned'}`);
            return;
        }
        if (sent.status === 'error') throw new Error(sent.error?.message || 'Buffer could not publish the post');
        if (Date.now() > deadline) {
            // It may still go out, so a retry must not post it again
            record(post, service, null);
            throw new Error('Still not published after 5 minutes. Check it in Buffer.');
        }
        await sleep(POLL_MS);
    }
}

async function main() {
    if (!BUFFER_API_KEY) throw new Error('The BUFFER_API_KEY secret is missing');
    const post = findPost();
    if (PLATFORM === 'all' && !dryRun) throw new Error('A real run posts to one platform at a time');
    const services = PLATFORM === 'all' ? SERVICES : [PLATFORM];
    if (!services.every(s => SERVICES.includes(s))) throw new Error(`Unknown platform "${PLATFORM}"`);
    for (const service of services) {
        if (!dryRun && alreadyPosted(post, service)) throw new Error(`"${post.title}" is already on ${service}`);
        await publish(post, service);
    }
}

main().catch(e => {
    console.error(`::error::${PLATFORM}: ${e.message}`);
    process.exitCode = 1;
});
