"use client";

import { useState } from "react";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import type { FeedbackItem } from "@/lib/data/feedback";

type FeedbackSectionProps = {
  initialFeedbacks: FeedbackItem[];
};

export function FeedbackSection({ initialFeedbacks }: FeedbackSectionProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);

  function handleFeedbackAdded(newFeedback: FeedbackItem) {
    setFeedbacks((prev) => [newFeedback, ...prev]);
  }

  return (
    <div className="feedback-container">
      <section className="composer-card feedback-main-section">
        <div className="composer-heading">
          <div>
            <p className="eyebrow">Bài tập thực hành • Nhóm 8</p>
            <h1 className="feedback-section-title">Góp ý khách hàng</h1>
          </div>
          <span className="feedback-badge-requirement">
            Zod Validation + Server Action
          </span>
        </div>

        <div className="requirement-box">
          <h2 className="req-title">📋 Yêu cầu & Tiêu chí kiểm tra đề bài:</h2>
          <ul className="req-list">
            <li>
              <span className="req-icon">✅</span>
              <strong>Trường &quot;Nội dung&quot;:</strong> Bắt buộc phải trên 20 ký tự (tối thiểu từ 21 ký tự trở lên). Nếu nhập ≤ 20 ký tự sẽ báo lỗi.
            </li>
            <li>
              <span className="req-icon">✅</span>
              <strong>Trường &quot;Số điện thoại&quot;:</strong> Phải đúng định dạng số điện thoại Việt Nam (10 chữ số, đầu 03, 05, 07, 08, 09 hoặc mã +84).
            </li>
            <li>
              <span className="req-icon">✅</span>
              <strong>Thông báo validation:</strong> Hiển thị thông báo lỗi chi tiết, trực quan tại từng trường và cảnh báo tổng quát.
            </li>
          </ul>
        </div>

        <FeedbackForm onFeedbackAdded={handleFeedbackAdded} />
      </section>

      <section className="post-section feedback-history-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dữ liệu đã ghi nhận</p>
            <h2>Danh sách góp ý gần đây</h2>
          </div>
          <span className="post-total">{feedbacks.length} ý kiến</span>
        </div>
        <FeedbackList feedbacks={feedbacks} />
      </section>
    </div>
  );
}
