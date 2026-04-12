import type { client } from "@/lib/api/client";
import type { Data } from "./utils";

export type GenerateDto = Data<(typeof client)["api"]["generate"]["playground"]["post"]>;
export type TemplateListDto = Data<(typeof client)["api"]["templates"]["get"]>;
export type TemplateInfo = TemplateListDto[number];
