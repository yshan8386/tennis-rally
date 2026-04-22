import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const message =
    params.message === "signup"
      ? "회원가입이 접수되었습니다. 이메일 인증이 켜져 있다면 메일을 확인해 주세요."
      : params.error === "callback"
        ? "인증 링크 처리에 실패했습니다. 다시 로그인해 주세요."
        : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-5 py-10">
      <LoginForm message={message} />
    </main>
  );
}
