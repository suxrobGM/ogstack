import { singleton } from "tsyringe";
import type { ChatRequest, PromptProvider } from "./utils";

/**
 * Claude Code CLI (`claude -p`) adapter for local development. Lets you run
 * the page-analysis and prompt-variation LLM calls against whatever Claude
 * Code subscription you already have, with no API key wired into the server.
 *
 * Not for production: spawns a subprocess per call, so latency is dominated
 * by CLI startup (~1-2s) and the provider has no streaming / batching.
 *
 * Enable with `CLAUDE_CODE_ENABLED=true`. Override the model with
 * `CLAUDE_CODE_MODEL=sonnet` (or `opus`, `haiku`, or a full model id).
 * The `claude` binary is expected to be on PATH.
 *
 * `temperature` and `maxTokens` from `ChatRequest` are IGNORED — the CLI
 * doesn't expose them. `json: true` is honored by appending a JSON-only
 * instruction to the system prompt (the CLI has no native JSON-output mode
 * for `-p` that matches our raw-text contract).
 */
@singleton()
export class ClaudeCodePromptProvider implements PromptProvider {
  readonly id = "claude-code";
  readonly model = process.env.CLAUDE_CODE_MODEL || "opus-4-7";
  private readonly enabled = process.env.CLAUDE_CODE_ENABLED === "true";

  isEnabled(): boolean {
    return this.enabled;
  }

  async chat(req: ChatRequest): Promise<string> {
    if (!this.enabled) throw new Error("Claude Code CLI provider is not enabled");

    const system = req.json
      ? `${req.system}\n\nRespond with ONLY the JSON object. No prose, no markdown fences, no commentary.`
      : req.system;

    const args = [
      "-p",
      "--output-format",
      "text",
      "--max-turns",
      "1",
      "--model",
      this.model,
      "--append-system-prompt",
      system,
    ];

    const proc = Bun.spawn({
      cmd: ["claude", ...args],
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    req.signal?.addEventListener("abort", () => proc.kill(), { once: true });

    proc.stdin.write(req.user);
    await proc.stdin.end();

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    if (exitCode !== 0) {
      throw new Error(
        `claude -p exited with code ${exitCode}: ${stderr.slice(0, 500) || "(no stderr)"}`,
      );
    }
    return stdout.trim();
  }
}
