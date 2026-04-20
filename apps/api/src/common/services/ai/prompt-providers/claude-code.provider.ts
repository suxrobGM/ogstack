import { singleton } from "tsyringe";
import type { ChatRequest, PromptProvider } from "./utils";

/**
 * Local-dev adapter that shells out to `claude -p`, reusing your Claude Code
 * subscription instead of an API key. Not for production: ~1-2s CLI startup
 * per call, no streaming. `temperature`/`maxTokens` are ignored; `json: true`
 * is enforced via a system-prompt suffix.
 *
 * Enable with `CLAUDE_CODE_ENABLED=true`; set `CLAUDE_CODE_MODEL` to an alias
 * (`opus`, `sonnet`, `haiku`) or full model id. `claude` must be on PATH.
 */
@singleton()
export class ClaudeCodePromptProvider implements PromptProvider {
  readonly id = "claude-code";
  readonly model = process.env.CLAUDE_CODE_MODEL!;
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
      const detail = stderr.trim() || stdout.trim() || "(no output)";
      throw new Error(`claude -p exited with code ${exitCode}: ${detail.slice(0, 500)}`);
    }
    return stdout.trim();
  }
}
