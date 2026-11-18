// PreToolUse PR gate: blocks pushes and PR publication unless the Jira-scoped
// output directory contains passing verification and final-output attestations.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
}

function collectCommandStrings(value, key = "") {
  if (!value || typeof value !== "object") {
    return typeof value === "string" && /command|cmd|script/i.test(key)
      ? [value]
      : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectCommandStrings(item, key));
  }
  return Object.entries(value).flatMap(([childKey, childValue]) =>
    collectCommandStrings(childValue, childKey),
  );
}

function isWorkspaceRoot(candidate) {
  return fs.existsSync(path.join(candidate, ".github", "agents", "orchestrator.agent.md"));
}

function findWorkspaceRoot(event) {
  const starts = [event.cwd, process.cwd(), path.resolve(__dirname, "..", "..")].filter(
    (value) => typeof value === "string" && value.length > 0,
  );
  for (const start of starts) {
    let current = path.resolve(start);
    for (let depth = 0; depth < 8; depth += 1) {
      if (isWorkspaceRoot(current)) return current;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

function readRequired(root, relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) throw new Error(`Required gate artifact is missing: ${relativePath}`);
  return fs.readFileSync(file, "utf8");
}

function canonicalIssueId(value) {
  const candidate = String(value || "").trim();
  if (/^\d+$/.test(candidate)) return candidate;
  if (/^[A-Za-z][A-Za-z0-9_]*-\d+$/.test(candidate)) return candidate.toUpperCase();
  return null;
}

function getIssueId(event, root, commandText) {
  const toolInput = event.toolInput || event.tool_input || {};
  const suppliedHead = typeof toolInput.head === "string" ? toolInput.head : "";
  if (suppliedHead) {
    const branchName = suppliedHead.includes(":")
      ? suppliedHead.slice(suppliedHead.lastIndexOf(":") + 1)
      : suppliedHead;
    const headMatch = branchName.match(/^sdlc\/([a-z][a-z0-9_]*-\d+|\d+)$/i);
    return headMatch ? canonicalIssueId(headMatch[1]) : null;
  }

  const branchMatch = commandText.match(/\bsdlc\/([a-z][a-z0-9_]*-\d+|\d+)\b/i);
  const fromCommand = branchMatch ? canonicalIssueId(branchMatch[1]) : null;
  if (fromCommand) return fromCommand;

  try {
    const branch = execFileSync("git", ["branch", "--show-current"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const match = branch.match(/^sdlc\/([a-z][a-z0-9_]*-\d+|\d+)$/i);
    return match ? canonicalIssueId(match[1]) : null;
  } catch {
    return null;
  }
}

try {
  const event = JSON.parse(fs.readFileSync(0, "utf8"));
  const toolName = String(event.toolName || event.tool_name || "").toLowerCase();
  const commandText = collectCommandStrings(event.toolInput || event.tool_input || {})
    .join("\n")
    .toLowerCase();
  const publishingPullRequest =
    (/github/.test(toolName) && /create_pull_request|push_files/.test(toolName)) ||
    /\bgit\s+push\b|\bgh\s+pr\s+create\b/.test(commandText);
  if (!publishingPullRequest) process.exit(0);

  const root = findWorkspaceRoot(event);
  if (!root) throw new Error("Cannot locate this workspace to validate PR publication evidence.");

  const issueId = getIssueId(event, root, commandText);
  if (!issueId) {
    throw new Error("Cannot determine a valid Jira ID from the PR head or current sdlc/<JIRA-ID> branch.");
  }
  const docsPath = path.join("output", issueId, "docs");
  const state = readRequired(root, path.join(docsPath, "sdlc-state.md"));
  const verification = readRequired(root, path.join(docsPath, "verification.md"));
  readRequired(root, path.join(docsPath, "final-output.md"));
  readRequired(root, path.join(docsPath, "final-output.docx"));

  if (!/^\s*PR publication gate:\s*PASS\s*$/im.test(state)) {
    throw new Error(`${docsPath}/sdlc-state.md must contain \`PR publication gate: PASS\`.`);
  }
  if (!/^\s*Unresolved blockers:\s*none\s*$/im.test(state)) {
    throw new Error(`${docsPath}/sdlc-state.md must contain \`Unresolved blockers: none\`.`);
  }
  if (!/^\s*Final-output validation:\s*PASS\s*$/im.test(state)) {
    throw new Error(`${docsPath}/sdlc-state.md must contain \`Final-output validation: PASS\`.`);
  }

  const status = verification.match(/^\s*Final status:\s*(PASS|PASS_WITH_WARNINGS|FAIL)\s*$/im);
  if (!status || status[1].toUpperCase() === "FAIL") {
    throw new Error(
      `${docsPath}/verification.md must report \`Final status: PASS\` or \`PASS_WITH_WARNINGS\`.`,
    );
  }
  if (
    status[1].toUpperCase() === "PASS_WITH_WARNINGS" &&
    !/^\s*Warning acceptance:\s*approved by user\s*$/im.test(state)
  ) {
    throw new Error(
      `PASS_WITH_WARNINGS requires \`Warning acceptance: approved by user\` in ${docsPath}/sdlc-state.md.`,
    );
  }
  if (!/^\s*Final-output validation:\s*PASS\s*$/im.test(verification)) {
    throw new Error(`${docsPath}/verification.md must contain \`Final-output validation: PASS\`.`);
  }
} catch (error) {
  deny(`PR publication gate blocked: ${error.message}`);
}
