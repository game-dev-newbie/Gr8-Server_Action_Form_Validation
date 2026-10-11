import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeedbacks } from "@/lib/data/feedback";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";

export const metadata: Metadata = {
  title: "Góp ý khách hàng (Bài tập)",
  description:
    "Form Góp ý khách hàng với kiểm tra Zod và Server Action theo yêu cầu đề bài Nhóm 8.",
};

export default async function FeedbackPage() {
  const currentUser = await getCurrentUser();
  const feedbacks = await getFeedbacks();

  return (
    <main className="feed-shell">
      <header className="feed-header">
        <div className="header-inner">
          <Link href="/feed" className="feed-brand" aria-label="Nexus Social Network">
            <span className="feed-brand-logo" aria-hidden="true">
              <Image src="/icon.png" alt="" fill priority sizes="44px" />
            </span>
            <span className="feed-brand-copy">
              <strong>Nexus</strong>
              <small>Social Network</small>
            </span>
          </Link>

          <nav className="feedback-nav-links" aria-label="Điều hướng chính">
            <Link href="/feed" className="nav-action-btn secondary-button">
              🏠 Bảng tin
            </Link>
            {currentUser ? (
              <span className="user-greeting">
                Chào, <strong>{currentUser.username}</strong>
              </span>
            ) : (
              <Link href="/login" className="nav-action-btn primary-button-outline">
                🔑 Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="feed-content feedback-page-content">
        <FeedbackSection initialFeedbacks={feedbacks} />
      </div>
    </main>
  );
}
