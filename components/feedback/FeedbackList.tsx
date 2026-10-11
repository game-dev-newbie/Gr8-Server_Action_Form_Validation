"use client";

import type { FeedbackItem } from "@/lib/data/feedback";

type FeedbackListProps = {
  feedbacks: FeedbackItem[];
};

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">📭</span>
        <h2>Chưa có góp ý nào</h2>
        <p>Hãy là người đầu tiên gửi góp ý cho chúng tôi bằng form bên trên!</p>
      </div>
    );
  }

  return (
    <div className="feedback-history-list">
      {feedbacks.map((item) => (
        <article key={item.id} className="feedback-item-card">
          <div className="feedback-item-header">
            <div className="feedback-item-user">
              <div className="avatar-placeholder" aria-hidden="true">
                {item.fullName.trim().charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="feedback-item-name">{item.fullName}</h3>
                <div className="feedback-item-meta">
                  <span className="feedback-phone-tag">📞 {item.phoneNumber}</span>
                  {item.email && <span className="feedback-email-tag">✉️ {item.email}</span>}
                </div>
              </div>
            </div>

            <div className="feedback-item-badges">
              <span className="topic-badge">{item.topic}</span>
              <span className="length-badge">
                {item.content.length} ký tự
              </span>
            </div>
          </div>

          <div className="feedback-item-body">
            <p className="feedback-item-content">{item.content}</p>
          </div>

          <footer className="feedback-item-footer">
            <time dateTime={item.createdAt}>
              🕒 {new Date(item.createdAt).toLocaleString("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </footer>
        </article>
      ))}
    </div>
  );
}
