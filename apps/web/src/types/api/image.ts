import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type ImageListResponse = Data<(typeof client)["api"]["images"]["get"]>;
export type ImageItem = ImageListResponse["items"][number];

export type ImageGenerateBody = Parameters<(typeof client)["api"]["images"]["post"]>[0];

type ImageByIdRoutes = ReturnType<(typeof client)["api"]["images"]>;
export type ImageUpdateBody = Parameters<ImageByIdRoutes["patch"]>[0];
