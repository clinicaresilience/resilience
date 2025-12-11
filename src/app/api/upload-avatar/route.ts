import { createAdminClient } from "@/lib/server-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient(); // service role key

    const formData = await req.formData();
    const file = formData.get("avatar") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    const fileName = `${userId}/avatar-${Date.now()}.${file.name.split('.').pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, fileBuffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
