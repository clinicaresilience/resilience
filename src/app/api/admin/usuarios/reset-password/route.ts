import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Generate new password
    const newPassword = genPassword();

    // Reset password using admin API
    const { error: resetError } = await supabase.auth.admin.updateUserById(
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
