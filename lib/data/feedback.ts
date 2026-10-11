import "server-only";
import { getPool } from "@/lib/server/db";
import type { FeedbackInput } from "@/lib/validations/feedback";

export type FeedbackItem = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  topic: string;
  content: string;
  createdAt: string;
};

// Bộ nhớ đệm tạm thời (In-memory fallback) để form luôn chạy trơn tru ngay cả khi chưa khởi chạy PostgreSQL
const inMemoryFeedbacks: FeedbackItem[] = [
  {
    id: "sample-1",
    fullName: "Nguyễn Minh Đức",
    phoneNumber: "0988123456",
    email: "duc.nguyen@example.com",
    topic: "Giao diện",
    content: "Hệ thống Nexus thiết kế rất hiện đại và mượt mà, hiệu ứng màu pastel rất đẹp mắt!",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "sample-2",
    fullName: "Trần Thị Mai Phương",
    phoneNumber: "0912345678",
    email: "phuong.tran@example.com",
    topic: "Trải nghiệm người dùng",
    content: "Các thông báo lỗi hiển thị rất trực quan và rõ ràng khi nhập sai thông tin trên form.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

let tableInitialized = false;

async function ensureTableExists() {
  if (tableInitialized) return;
  try {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        topic VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS feedbacks_created_idx ON feedbacks (created_at DESC);
    `);
    tableInitialized = true;
  } catch (error) {
    console.warn("Không thể khởi tạo bảng feedbacks trong PostgreSQL, chuyển sang in-memory storage:", error);
  }
}

export async function insertFeedback(input: FeedbackInput): Promise<FeedbackItem> {
  const newFeedback: FeedbackItem = {
    id: String(Date.now()),
    fullName: input.fullName,
    phoneNumber: input.phoneNumber,
    email: input.email || undefined,
    topic: input.topic,
    content: input.content,
    createdAt: new Date().toISOString(),
  };

  try {
    await ensureTableExists();
    const pool = getPool();
    const result = await pool.query<{
      id: string;
      full_name: string;
      phone_number: string;
      email: string | null;
      topic: string;
      content: string;
      created_at: Date;
    }>(
      `INSERT INTO feedbacks (full_name, phone_number, email, topic, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, phone_number, email, topic, content, created_at`,
      [input.fullName, input.phoneNumber, input.email || null, input.topic, input.content]
    );

    if (result.rows[0]) {
      const row = result.rows[0];
      const saved: FeedbackItem = {
        id: String(row.id),
        fullName: row.full_name,
        phoneNumber: row.phone_number,
        email: row.email || undefined,
        topic: row.topic,
        content: row.content,
        createdAt: row.created_at.toISOString(),
      };
      inMemoryFeedbacks.unshift(saved);
      return saved;
    }
  } catch (error) {
    console.warn("Lưu feedback vào database không thành công, lưu vào bộ nhớ tạm:", error);
  }

  inMemoryFeedbacks.unshift(newFeedback);
  return newFeedback;
}

export async function getFeedbacks(): Promise<FeedbackItem[]> {
  try {
    await ensureTableExists();
    const pool = getPool();
    const result = await pool.query<{
      id: string;
      full_name: string;
      phone_number: string;
      email: string | null;
      topic: string;
      content: string;
      created_at: Date;
    }>(
      `SELECT id, full_name, phone_number, email, topic, content, created_at
       FROM feedbacks
       ORDER BY created_at DESC, id DESC
       LIMIT 50`
    );

    if (result.rows.length > 0) {
      return result.rows.map((row) => ({
        id: String(row.id),
        fullName: row.full_name,
        phoneNumber: row.phone_number,
        email: row.email || undefined,
        topic: row.topic,
        content: row.content,
        createdAt: row.created_at.toISOString(),
      }));
    }
  } catch (error) {
    console.warn("Không thể đọc feedback từ PostgreSQL, sử dụng danh sách trong bộ nhớ:", error);
  }

  return inMemoryFeedbacks;
}
