import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    
    const response = await fetch(`${backendUrl}/upload`, {
      method: 'POST',
      body: data,
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {})
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, message: errorText }, { status: response.status });
    }

    const json = await response.json();
    return NextResponse.json({ success: true, url: json.url });
  } catch (error) {
    console.error("Upload error", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
