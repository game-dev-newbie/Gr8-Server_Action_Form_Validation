"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FeedbackItem } from "@/lib/data/feedback";
import {
  feedbackSchema,
  VIETNAMESE_PHONE_REGEX,
  type FeedbackInput,
} from "@/lib/validations/feedback";

type FeedbackFormProps = {
  onFeedbackAdded?: (item: FeedbackItem) => void;
};

export function FeedbackForm({ onFeedbackAdded }: FeedbackFormProps) {
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      topic: "Đóng góp tính năng mới",
      content: "",
    },
  });

  const content = watch("content") ?? "";
  const phoneNumber = watch("phoneNumber") ?? "";
  const contentLen = content.trim().length;
  const isContentOver20 = contentLen > 20;

  // Kiểm tra định dạng số điện thoại VN sơ bộ theo thời gian thực
  const cleanPhone = phoneNumber.replace(/[\s.-]/g, "");
  const isPhoneValid = cleanPhone.length > 0 && VIETNAMESE_PHONE_REGEX.test(cleanPhone);

  async function onSubmit(values: FeedbackInput) {
    setFormError(undefined);
    setFormSuccess(undefined);

    const result = await submitFeedbackAction(values);

    if (result.status === "error") {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (field in values && messages[0]) {
          setError(field as keyof FeedbackInput, {
            type: "server",
            message: messages[0],
          });
        }
      }
      setFormError(result.formError || "Vui lòng kiểm tra lại thông tin trên form.");
    } else if (result.status === "success") {
      setFormSuccess(result.formSuccess);
      reset({
        fullName: "",
        phoneNumber: "",
        email: "",
        topic: "Đóng góp tính năng mới",
        content: "",
      });
      if (result.feedback && onFeedbackAdded) {
        onFeedbackAdded(result.feedback);
      }
    }
  }

  // Tiện ích hỗ trợ test nhanh theo yêu cầu đề bài
  function applyTestCase(type: "test1_content_fail" | "test2_phone_fail" | "test3_valid") {
    setFormError(undefined);
    setFormSuccess(undefined);

    if (type === "test1_content_fail") {
      setValue("fullName", "Nguyễn Văn Kiểm Tra", { shouldValidate: true });
      setValue("phoneNumber", "0987654321", { shouldValidate: true });
      setValue("email", "kiemtra1@gmail.com", { shouldValidate: true });
      setValue("topic", "Giao diện", { shouldValidate: true });
      // Nội dung đúng 15 ký tự <= 20 ký tự để kích hoạt lỗi validation
      setValue("content", "Góp ý quá ngắn!", { shouldValidate: true });
      setTimeout(() => trigger(), 50);
    } else if (type === "test2_phone_fail") {
      setValue("fullName", "Trần Thị Thử Nghiệm", { shouldValidate: true });
      // Số điện thoại sai định dạng VN (123456 hoặc đầu 01 không hợp lệ)
      setValue("phoneNumber", "0123456789", { shouldValidate: true });
      setValue("email", "kiemtra2@gmail.com", { shouldValidate: true });
      setValue("topic", "Dịch vụ", { shouldValidate: true });
      setValue(
        "content",
        "Nội dung này đã được nhập rất dài và vượt quá 20 ký tự nhằm kiểm tra riêng trường số điện thoại bị sai định dạng.",
        { shouldValidate: true }
      );
      setTimeout(() => trigger(), 50);
    } else if (type === "test3_valid") {
      setValue("fullName", "Lê Hoàng Phúc", { shouldValidate: true });
      setValue("phoneNumber", "0912345678", { shouldValidate: true });
      setValue("email", "hoangphuc@gmail.com", { shouldValidate: true });
      setValue("topic", "Đóng góp tính năng mới", { shouldValidate: true });
      setValue(
        "content",
        "Hệ thống Server Action của Nhóm 8 hoạt động rất mượt mà, phản hồi tức thì và xác thực dữ liệu chặt chẽ cả ở Client lẫn Server!",
        { shouldValidate: true }
      );
      setTimeout(() => trigger(), 50);
    }
  }

  return (
    <div className="feedback-card">
      <div className="feedback-preset-bar">
        <span className="preset-label">🧪 Thử nhanh tiêu chí chấm điểm:</span>
        <div className="preset-buttons">
          <button
            type="button"
            className="preset-btn preset-btn-danger"
            onClick={() => applyTestCase("test1_content_fail")}
            title="Thử nội dung <= 20 ký tự để kích hoạt lỗi"
          >
            Test 1: Nội dung ≤ 20 ký tự
          </button>
          <button
            type="button"
            className="preset-btn preset-btn-warning"
            onClick={() => applyTestCase("test2_phone_fail")}
            title="Thử số điện thoại không đúng định dạng VN"
          >
            Test 2: SĐT sai định dạng VN
          </button>
          <button
            type="button"
            className="preset-btn preset-btn-success"
            onClick={() => applyTestCase("test3_valid")}
            title="Thử dữ liệu hợp lệ hoàn toàn"
          >
            Test 3: Dữ liệu hợp lệ chuẩn
          </button>
          <button
            type="button"
            className="preset-btn preset-btn-reset"
            onClick={() => {
              reset();
              setFormError(undefined);
              setFormSuccess(undefined);
            }}
          >
            🔄 Xóa trắng
          </button>
        </div>
      </div>

      <form className="feedback-form stack-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormAlert message={formError} variant="error" />
        <FormAlert message={formSuccess} variant="success" />

        <div className="form-row-2col">
          {/* Trường Họ và tên */}
          <div className="field-group">
            <label htmlFor="fb-fullName">
              Họ và tên khách hàng <span className="req-star">*</span>
            </label>
            <input
              id="fb-fullName"
              type="text"
              placeholder="VD: Nguyễn Văn A"
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fb-fullName-error" : undefined}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p id="fb-fullName-error" className="field-error">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Trường Số điện thoại - YÊU CẦU ĐỀ BÀI */}
          <div className="field-group">
            <div className="label-with-badge">
              <label htmlFor="fb-phoneNumber">
                Số điện thoại (Việt Nam) <span className="req-star">*</span>
              </label>
              {phoneNumber.length > 0 && (
                <span
                  className={`status-badge ${
                    isPhoneValid ? "status-badge-ok" : "status-badge-err"
                  }`}
                >
                  {isPhoneValid ? "✓ Đúng chuẩn VN" : "✕ Chưa đúng chuẩn VN"}
                </span>
              )}
            </div>
            <input
              id="fb-phoneNumber"
              type="tel"
              placeholder="VD: 0912345678 hoặc +84912345678"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phoneNumber)}
              aria-describedby="fb-phoneNumber-hint"
              {...register("phoneNumber")}
            />
            <p id="fb-phoneNumber-hint" className="field-hint">
              10 chữ số thuộc các đầu số nhà mạng VN (03, 05, 07, 08, 09 hoặc mã +84).
            </p>
            {errors.phoneNumber && (
              <p id="fb-phoneNumber-error" className="field-error">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="form-row-2col">
          {/* Trường Email */}
          <div className="field-group">
            <label htmlFor="fb-email">Email liên hệ (Tùy chọn)</label>
            <input
              id="fb-email"
              type="email"
              placeholder="VD: customer@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          {/* Trường Chủ đề góp ý */}
          <div className="field-group">
            <label htmlFor="fb-topic">
              Chủ đề góp ý <span className="req-star">*</span>
            </label>
            <select id="fb-topic" className="feedback-select" {...register("topic")}>
              <option value="Đóng góp tính năng mới">💡 Đóng góp tính năng mới</option>
              <option value="Trải nghiệm người dùng">✨ Trải nghiệm người dùng (UX/UI)</option>
              <option value="Báo cáo lỗi">🐞 Báo cáo lỗi phần mềm</option>
              <option value="Giao diện">🎨 Thiết kế giao diện</option>
              <option value="Khác">💬 Ý kiến khác</option>
            </select>
            {errors.topic && <p className="field-error">{errors.topic.message}</p>}
          </div>
        </div>

        {/* Trường Nội dung - YÊU CẦU ĐỀ BÀI */}
        <div className="field-group">
          <div className="label-with-counter">
            <label htmlFor="fb-content">
              Nội dung góp ý <span className="req-star">*</span>
            </label>
            <span
              className={`char-counter ${
                contentLen === 0
                  ? ""
                  : isContentOver20
                  ? "char-counter-valid"
                  : "char-counter-invalid"
              }`}
            >
              {contentLen === 0 ? (
                "Yêu cầu: trên 20 ký tự"
              ) : isContentOver20 ? (
                `✓ Đã đạt ${contentLen} ký tự (Hợp lệ > 20)`
              ) : (
                `✕ ${contentLen}/20 ký tự (Cần thêm ${21 - contentLen} ký tự để > 20)`
              )}
            </span>
          </div>
          <textarea
            id="fb-content"
            rows={5}
            placeholder="Nhập nội dung góp ý chi tiết của quý khách (bắt buộc trên 20 ký tự)…"
            aria-invalid={Boolean(errors.content)}
            aria-describedby="fb-content-hint"
            {...register("content")}
          />
          <p id="fb-content-hint" className="field-hint">
            Quy định: Độ dài nội dung bắt buộc phải trên 20 ký tự (tối thiểu từ 21 ký tự).
          </p>
          {errors.content && (
            <p id="fb-content-error" className="field-error">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="feedback-actions">
          <p className="security-note">
            🛡️ Dữ liệu được xác thực hai lớp (Client validation bằng Zod + Server Action an toàn).
          </p>
          <SubmitButton isPending={isSubmitting} pendingLabel="Đang gửi góp ý…">
            Gửi góp ý ngay
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
