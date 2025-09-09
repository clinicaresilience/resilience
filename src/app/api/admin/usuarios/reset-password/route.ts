import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { createAdminClient } from '@/lib/server-admin';

function genPassword(): string {
  const part = Math.random().toString(36).slice(-6);
  const num = Math.floor(100 + Math.random() * 900).toString();
  return `${part}${num}`;
}

export async function POST(request: NextRequest) {
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
    const { userId, password } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Use provided password or generate new one
    const newPassword = password || genPassword();

    // Create admin client for admin operations
    const adminSupabase = createAdminClient();

    // Reset password using admin API
    const { error: resetError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (resetError) {
      console.error('Error resetting password:', resetError);
      return NextResponse.json(
        { error: 'Error resetting password' },
        { status: 500 }
      );
    }

    // Update primeiro_acesso to true
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ primeiro_acesso: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating primeiro_acesso:', updateError);
      // Don't fail the request if this update fails, just log it
    }

    return NextResponse.json({
      success: true,
      newPassword
    });

  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
