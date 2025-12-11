import { NextResponse, NextRequest } from "next/server";
import { ClinicaInfoService } from "@/services/database/clinica-info.service";
import { createClient } from "@/lib/server";

// GET /api/clinica-info
// Busca todas as redes sociais da clínica
export async function GET() {
  try {
    const redesSociais = await ClinicaInfoService.getRedesSociais();
    
    return NextResponse.json({
      success: true,
      data: redesSociais
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar redes sociais da clínica:", error);
    return NextResponse.json(
      { 
        error: "Erro ao buscar redes sociais da clínica", 
        detail: error instanceof Error ? error.message : "Erro desconhecido" 
      },
      { status: 500 }
    );
  }
}

// POST /api/clinica-info
// Cria uma nova rede social (apenas administradores)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (userData?.tipo_usuario !== "administrador") {
      return NextResponse.json({ 
        error: "Apenas administradores podem criar redes sociais" 
      }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { nome, link, descricao } = body || {};

    if (!nome?.trim() || !link?.trim()) {
      return NextResponse.json({ 
        error: "Nome e link são obrigatórios" 
      }, { status: 400 });
    }

    // Verificar se já existe WhatsApp cadastrado
    if (nome.toLowerCase().includes('whatsapp')) {
      const whatsappExistente = await ClinicaInfoService.getRedeSocialByNome('WhatsApp');
      if (whatsappExistente) {
        return NextResponse.json({ 
          error: "Já existe um WhatsApp cadastrado para a clínica. Edite o existente ou remova-o primeiro." 
        }, { status: 409 });
      }
    }

    const redeSocial = await ClinicaInfoService.createRedeSocial({
      nome: nome.trim(),
      link: link.trim(),
      descricao: descricao?.trim()
    });

    return NextResponse.json({
      success: true,
      data: redeSocial,
      message: "Rede social criada com sucesso!"
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar rede social:", error);
    return NextResponse.json(
      { 
        error: "Erro ao criar rede social", 
        detail: error instanceof Error ? error.message : "Erro desconhecido" 
      },
      { status: 500 }
    );
  }
}

// PUT /api/clinica-info
// Atualiza uma rede social existente (apenas administradores)
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (userData?.tipo_usuario !== "administrador") {
      return NextResponse.json({ 
        error: "Apenas administradores podem atualizar redes sociais" 
      }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, nome, link, descricao } = body || {};

    if (!id) {
      return NextResponse.json({ 
        error: "ID da rede social é obrigatório" 
      }, { status: 400 });
    }

    // Verificar se a rede social existe
    const redeSocialExistente = await ClinicaInfoService.getRedeSocialById(id);
    if (!redeSocialExistente) {
      return NextResponse.json({ 
        error: "Rede social não encontrada" 
      }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    
    if (nome !== undefined) {
      if (!nome?.trim()) {
        return NextResponse.json({ 
          error: "Nome não pode estar vazio" 
        }, { status: 400 });
      }
      
      // Verificar se está tentando mudar para WhatsApp e já existe outro
      if (nome.toLowerCase().includes('whatsapp')) {
        const whatsappExistente = await ClinicaInfoService.getRedeSocialByNome('WhatsApp');
        if (whatsappExistente && whatsappExistente.id !== id) {
          return NextResponse.json({ 
            error: "Já existe um WhatsApp cadastrado para a clínica." 
          }, { status: 409 });
        }
      }
      
      updateData.nome = nome.trim();
    }
    
    if (link !== undefined) {
      if (!link?.trim()) {
        return NextResponse.json({ 
          error: "Link não pode estar vazio" 
        }, { status: 400 });
      }
      updateData.link = link.trim();
    }
    
    if (descricao !== undefined) updateData.descricao = descricao?.trim();

    const redeSocial = await ClinicaInfoService.updateRedeSocial(id, updateData);

    return NextResponse.json({
      success: true,
      data: redeSocial,
      message: "Rede social atualizada com sucesso!"
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar rede social:", error);
    return NextResponse.json(
      { 
        error: "Erro ao atualizar rede social", 
        detail: error instanceof Error ? error.message : "Erro desconhecido" 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/clinica-info
// Remove uma rede social (apenas administradores)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é administrador
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (userData?.tipo_usuario !== "administrador") {
      return NextResponse.json({ 
        error: "Apenas administradores podem remover redes sociais" 
      }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ 
        error: "ID da rede social é obrigatório" 
      }, { status: 400 });
    }

    // Verificar se a rede social existe
    const redeSocialExistente = await ClinicaInfoService.getRedeSocialById(id);
    if (!redeSocialExistente) {
      return NextResponse.json({ 
        error: "Rede social não encontrada" 
      }, { status: 404 });
    }

    await ClinicaInfoService.deleteRedeSocial(id);

    return NextResponse.json({
      success: true,
      message: "Rede social removida com sucesso!"
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao remover rede social:", error);
    return NextResponse.json(
      { 
        error: "Erro ao remover rede social", 
        detail: error instanceof Error ? error.message : "Erro desconhecido" 
      },
      { status: 500 }
    );
  }
}
