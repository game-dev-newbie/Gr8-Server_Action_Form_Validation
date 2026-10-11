import { z } from "zod";

/**
 * Regex kiểm tra số điện thoại di động Việt Nam:
 * - Bắt đầu bằng 0, +84 hoặc 84
 * - Theo sau là các đầu số mạng di động Việt Nam: 3, 5, 7, 8, 9
 * - Kèm theo đúng 8 chữ số phía sau (tổng cộng 10 số với đầu 0)
 */
export const VIETNAMESE_PHONE_REGEX = /^(?:(?:\+84|84|0)[35789]\d{8})$/;

export const feedbackSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên.")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ và tên không được vượt quá 100 ký tự."),

  phoneNumber: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại.")
    .refine((phone) => VIETNAMESE_PHONE_REGEX.test(phone.replace(/[\s.-]/g, "")), {
      message: "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678 hoặc +84912345678).",
    }),

  email: z
    .string()
    .trim()
    .email("Email không đúng định dạng.")
    .optional()
    .or(z.literal("")),

  topic: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn chủ đề góp ý."),

  content: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung góp ý.")
    .max(2000, "Nội dung góp ý không được vượt quá 2000 ký tự.")
    .refine((val) => val.length > 20, {
      message: "Nội dung góp ý phải trên 20 ký tự (tối thiểu 21 ký tự).",
    }),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
