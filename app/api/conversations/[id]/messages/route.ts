import { NextResponse } from "next/server";
import { addMessage, getConversation } from "@/lib/db";

// POST /api/conversations/[id]/messages — add a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { id, role, content } = await request.json();

    if (!id || !role || !content) {
      return NextResponse.json(
        { error: "id, role, and content are required" },
        { status: 400 }
      );
    }

    if (role !== "user" && role !== "assistant") {
      return NextResponse.json(
        { error: "role must be 'user' or 'assistant'" },
        { status: 400 }
      );
    }

    const conversation = getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    addMessage(conversationId, { id, role, content });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to add message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
