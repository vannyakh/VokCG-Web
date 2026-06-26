import type { ApiResponse } from "@vokcg/types";

export type ScriptResponse = ApiResponse<{ video_script: string }>;
export type TermsResponse = ApiResponse<{ video_terms: string[] }>;
export type TaskCreateResponse = ApiResponse<{ task_id: string }>;
