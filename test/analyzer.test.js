const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

function analyze(source) {
  const analyzer = path.join(__dirname, "..", "lib", "analyzer.js");
  const result = spawnSync(process.execPath, [analyzer], {
    input: source,
    encoding: "utf8",
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
      kind: "CompileError",
      reason:
        "Hooks must always be called in a consistent order, and may not be called conditionally. See the Rules of Hooks (https://react.dev/warnings/invalid-hook-call-warning)",
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

const noMemoNeededOutput = analyze(`
import { ClientContext } from "./ctx";

export const useClient = () => useNonNullableContext(ClientContext, "ClientContext");
`);

assert.deepEqual(noMemoNeededOutput, {
  optimized: [],
  failed: [],
});

const failedHookOutput = analyze(`
import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/lib/client";

type SampleResult =
  | { ready: true }
  | { ready: false; reason: "changed" | "missing" };

export const useSampleResource = () => {
  const client = useClient();

  return useQuery({
    queryFn: async (): Promise<SampleResult> => {
      try {
        const { ok, item } = await client.resource.load();
        if (!ok || !item) {
          return { ready: false, reason: "missing" };
        }

        if (item.kind === 1) {
          return { ready: true };
        }

        const reason = item.kind === 2 ? "changed" : "missing";
        return { ready: false, reason };
      } catch {
        return { ready: false, reason: "missing" };
      }
    },
  });
};
`);

assert.deepEqual(failedHookOutput, {
  optimized: [],
  failed: [
    {
      line: 9,
      kind: "CompileError",
      reason:
        "Support value blocks (conditional, logical, optional chaining, etc) within a try/catch statement",
    },
  ],
});

const objectPropOutput = analyze(`
const registry = {
    useSyntheticFeature: () => ({ value: externalValue }),
}
`);

assert.deepEqual(objectPropOutput, {
  optimized: [],
  failed: [],
});

const thinHookWrapperOutput = analyze(`
import { use } from "react"

const ValueContext = {}

export const useValue = () => use(ValueContext)
`);

assert.deepEqual(thinHookWrapperOutput.failed, []);

const namedFunctionExprOutput = analyze(`
const registry = {
  feature: function useSyntheticFeature() {
    return { value: externalValue }
  },
}
`);

assert.deepEqual(namedFunctionExprOutput, {
  optimized: [],
  failed: [],
});

const componentObjectPropOutput = analyze(`
const registry = {
  Widget: () => <div />,
}
`);

assert.deepEqual(componentObjectPropOutput, {
  optimized: [],
  failed: [],
});

console.log("analyzer tests passed");
