export interface RenderRequest {
  url: string;
  signal?: AbortSignal;
}

export interface RenderProvider {
  readonly id: string;
  isEnabled(): boolean;
  render(req: RenderRequest): Promise<string>;
}
