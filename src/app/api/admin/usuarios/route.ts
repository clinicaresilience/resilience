import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || userData?.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tipoUsuario = searchParams.get('tipo_usuario');

    if (!tipoUsuario || !['profissional', 'comum'].includes(tipoUsuario)) {
      return NextResponse.json(
        { error: 'tipo_usuario must be "profissional" or "comum"' },
        { status: 400 }
      );
    }

    // Fetch users by type
    const { data: usuarios, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo_usuario', tipoUsuario)
      .order('criado_em', { ascending: false });

    if (fetchError) {
      console.error('Error fetching usuarios:', fetchError);
      return NextResponse.json(
        { error: 'Error fetching users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ usuarios: usuarios || [] });

  } catch (error) {
    console.error('Error in usuarios API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || userData?.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, ativo } = body;

    if (!userId || typeof ativo !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and ativo (boolean) are required' },
        { status: 400 }
      );
    }

    // Update user status
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ ativo })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Error updating user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in usuarios PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || userData?.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      nome,
      cpf,
      telefone,
      area,
      especialidade,
      crp,
      bio,
      avatar_url
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!nome?.trim() || !cpf?.trim() || !telefone?.trim() || !area?.trim() || !especialidade?.trim() || !crp?.trim()) {
      return NextResponse.json(
        { error: 'Nome, CPF, telefone, área, especialidade e CRP são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate CPF format (should be 11 digits without formatting)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'CPF deve conter exatamente 11 dígitos' },
        { status: 400 }
      );
    }

    // Validate phone format (should be 11 digits without formatting)
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'Telefone deve conter exatamente 11 dígitos' },
        { status: 400 }
      );
    }

    // Check if CPF already exists for another user
    const { data: existingCpf, error: cpfError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('cpf', cpfLimpo)
      .neq('id', userId)
      .maybeSingle();

    if (cpfError) {
      console.error('Error checking CPF:', cpfError);
      return NextResponse.json(
        { error: 'Erro ao verificar CPF' },
        { status: 500 }
      );
    }

    if (existingCpf) {
      return NextResponse.json(
        { error: 'Este CPF já está cadastrado para outro usuário' },
        { status: 400 }
      );
    }

    // Check if CRP already exists for another user
    const { data: existingCrp, error: crpError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('crp', crp.trim())
      .neq('id', userId)
      .maybeSingle();

    if (crpError) {
      console.error('Error checking CRP:', crpError);
      return NextResponse.json(
        { error: 'Erro ao verificar CRP' },
        { status: 500 }
      );
    }

    if (existingCrp) {
      return NextResponse.json(
        { error: 'Este CRP já está cadastrado para outro usuário' },
        { status: 400 }
      );
    }

    // Update user data
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        nome: nome.trim(),
        cpf: cpfLimpo,
        telefone: telefoneLimpo,
        area: area.trim(),
        especialidade: especialidade.trim(),
        crp: crp.trim(),
        bio: bio?.trim() || null,
        avatar_url: avatar_url || null,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Error updating user data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in usuarios PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
