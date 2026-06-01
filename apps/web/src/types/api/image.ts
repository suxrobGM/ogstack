import type { client } from "@/lib/api/client";
import type { Body, Data } from "./utils";

export type ImageListResponse = Data<(typeof client)["api"]["images"]["get"]>;
export type ImageItem = ImageListResponse["items"][number];

export type ImageGenerateBody = Body<(typeof client)["api"]["images"]["post"]>;

type ImageByIdRoutes = ReturnType<(typeof client)["api"]["images"]>;
export type ImageUpdateBody = Body<ImageByIdRoutes["patch"]>;
