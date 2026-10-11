"use server";

import { revalidatePath } from "next/cache";
import { insertFeedback, type FeedbackItem } from "@/lib/data/feedback";
import type { FormActionState } from "@/lib/types/forms";
import { feedbackSchema } from "@/lib/validations/feedback";

export type FeedbackActionResponse = FormActionState & {
  feedback?: FeedbackItem;
};

export async function submitFeedbackAction(
  input: unknown
): Promise<FeedbackActionResponse> {
  const parsed = feedbackSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      formError: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bên dưới.",
    };
  }

  try {
    const feedback = await insertFeedback(parsed.data);
    revalidatePath("/feedback");

    return {
      status: "success",
      formSuccess: "Cảm ơn bạn! Góp ý của bạn đã được ghi nhận thành công.",
      feedback,
    };
  } catch (error) {
    console.error("Lỗi khi gửi góp ý:", error);
    return {
      status: "error",
      formError: "Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại sau.",
    };
  }
}
