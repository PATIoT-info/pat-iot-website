// Adds this run's post to the newest data/social-posts.json, so runs finishing together cannot undo each other.
const { existsSync, readFileSync, writeFileSync } = require('fs');

const STATE_FILE = 'data/social-posts.json';
const { SLUG, PLATFORM } = process.env;
const read = file => JSON.parse(readFileSync(file, 'utf8'));

const { id } = read('data/blogs.json').posts.find(p => p.slug === SLUG);
const state = existsSync(STATE_FILE) ? read(STATE_FILE) : {};
state[id] = { ...state[id], [PLATFORM]: read(process.argv[2])[id][PLATFORM] };
writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
