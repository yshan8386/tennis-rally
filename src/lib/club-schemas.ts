import { z } from "zod";

export type ClubFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

export const createClubSchema = z.object({
  name: z.string().min(2, "클럽명은 2자 이상 입력해 주세요.").trim(),
  type: z.enum(["club", "academy"], {
    error: "클럽 타입을 선택해 주세요.",
  }),
  city: z.string().min(1, "소재지를 입력해 주세요.").trim(),
  description: z.string().trim().optional(),
});
