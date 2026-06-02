const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

function analyze(source) {
    const analyzer = path.join(__dirname, '..', 'lib', 'analyzer.js');
    const result = spawnSync(process.execPath, [analyzer], {
        input: source,
        encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
}

const output = analyze(`
export function Optimized({ name }: { name: string }) {
  return <div>{name}</div>;
}

export function NotCompiled() {
  if (Math.random() > 0.5) {
    React.useState(0);
  }
  return <span>skip</span>;
}
`);

assert.deepEqual(output, {
    optimized: [2],
    failed: [
        {
            line: 6,
            kind: 'CompileError',
            reason: 'Hooks must always be called in a consistent order, and may not be called conditionally. See the Rules of Hooks (https://react.dev/warnings/invalid-hook-call-warning)',
        },
    ],
});

const optOutOutput = analyze(`
export function OptedOut() {
  "use no memo";
  return <div />;
}
`);

assert.deepEqual(optOutOutput, {
    optimized: [],
    failed: [],
});

console.log('analyzer tests passed');
