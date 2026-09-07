import assert from 'node:assert/strict';
import { parseCsvLine } from './importCollections.js';

// The one part of the import that can silently corrupt rows: quoted fields
// containing the delimiter, e.g. recycler_location = "Guindy, Chennai".
assert.deepEqual(parseCsvLine('a,b,c'), ['a', 'b', 'c']);
assert.deepEqual(parseCsvLine('a,"Guindy, Chennai",c'), ['a', 'Guindy, Chennai', 'c']);
assert.deepEqual(parseCsvLine('a,"say ""hi""",c'), ['a', 'say "hi"', 'c']);
assert.deepEqual(parseCsvLine('a,,c'), ['a', '', 'c']);
assert.deepEqual(parseCsvLine('Sunita Singh,61316.9,0'), ['Sunita Singh', '61316.9', '0']);

console.log('✅ parseCsvLine ok');
