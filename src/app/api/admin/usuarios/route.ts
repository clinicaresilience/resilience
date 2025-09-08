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
