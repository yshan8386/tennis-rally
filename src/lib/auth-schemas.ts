import { z } from "zod";

export type AuthFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

export const loginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다.").trim(),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export const signupSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력해 주세요.").trim(),
  email: z.string().email("이메일 형식이 올바르지 않습니다.").trim(),
  password: z.string().min(8, "비밀번호는 8자 이상 입력해 주세요."),
  gender: z.enum(["M", "F"], {
    error: "성별을 선택해 주세요.",
  }),
  birth_year: z.coerce
    .number()
    .int("출생연도는 숫자로 입력해 주세요.")
    .min(1900, "출생연도를 확인해 주세요.")
    .max(new Date().getFullYear(), "출생연도를 확인해 주세요."),
  phone: z.string().min(8, "핸드폰 번호를 입력해 주세요.").trim(),
  tennis_start_year: z.coerce
    .number()
    .int("테니스 시작 연도는 숫자로 입력해 주세요.")
    .min(1900, "테니스 시작 연도를 확인해 주세요.")
    .max(new Date().getFullYear(), "테니스 시작 연도를 확인해 주세요."),
  tennis_start_month: z.coerce
    .number()
    .int("테니스 시작 월은 숫자로 입력해 주세요.")
    .min(1, "테니스 시작 월은 1~12 사이여야 합니다.")
    .max(12, "테니스 시작 월은 1~12 사이여야 합니다."),
  city: z.string().min(1, "활동 지역을 입력해 주세요.").trim(),
});
