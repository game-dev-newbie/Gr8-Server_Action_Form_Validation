import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = { title: "Tạo tài khoản" };

export default function RegisterPage() {
  return (
    <>
      <div className="auth-heading">
        <p className="eyebrow">Bắt đầu cùng MiniSocial</p>
        <h1 id="auth-title">Tạo tài khoản</h1>
        <p>Đăng ký để chia sẻ bài viết đầu tiên của bạn.</p>
      </div>

      <RegisterForm />

      <p className="auth-switch">
        Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
      </p>
      <p className="auth-switch" style={{ marginTop: "0.75rem", paddingTop: "0.75rem" }}>
        📝 <Link href="/feedback">Xem bài tập: Form Góp ý khách hàng</Link>
      </p>
    </>
  );
}
