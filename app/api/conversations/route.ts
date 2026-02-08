import { NextResponse } from "next/server";
import { listConversations, createConversation } from "@/lib/db";

// GET /api/conversations — list all conversations
export async function GET() {
  try {
    const conversations = listConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Failed to list conversations:", error);
    return NextResponse.json(
      { error: "Failed to list conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations — create a new conversation
export async function POST(request: Request) {
  try {
    const { id, title } = await request.json();

    if (!id || !title) {
      return NextResponse.json(
        { error: "id and title are required" },
        { status: 400 }
      );
    }

    createConversation(id, title);
    return NextResponse.json({ id, title }, { status: 201 });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
