import { NextResponse } from 'next/server';
export async function POST(req) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 });
}
