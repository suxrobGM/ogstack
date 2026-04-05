import { t, type Static } from "elysia";
import { PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema, PaginationSchema } from "@/types/response";

export const ProjectSchema = t.Object({
  id: t.String(),
  publicId: t.String(),
  name: t.String(),
  domains: t.Array(t.String()),
  isActive: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const ProjectListQuerySchema = t.Composite([
  PaginationQueryBaseSchema,
  t.Object({
    search: t.Optional(t.String({ description: "Filter by project name" })),
  }),
]);

export const CreateProjectBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  domains: t.Optional(t.Array(t.String(), { default: [] })),
});

export const UpdateProjectBodySchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  domains: t.Optional(t.Array(t.String())),
});

export const ProjectListResponseSchema = PaginatedResponseSchema(ProjectSchema);

export type Project = Static<typeof ProjectSchema>;
export type ProjectListQuery = Static<typeof ProjectListQuerySchema>;
export type CreateProjectBody = Static<typeof CreateProjectBodySchema>;
export type UpdateProjectBody = Static<typeof UpdateProjectBodySchema>;
