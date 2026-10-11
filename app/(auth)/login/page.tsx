import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <>
      <div className="auth-heading">
        <h1 id="auth-title">Đăng nhập</h1>
      </div>

      <LoginForm />

      <p className="auth-switch">
        Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
      </p>
      <p className="auth-switch" style={{ marginTop: "0.75rem", paddingTop: "0.75rem" }}>
        📝 <Link href="/feedback">Xem bài tập: Form Góp ý khách hàng</Link>
      </p>
    </>
  );
}
