const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://xozjufubqqtrawmwlhkm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvemp1ZnVicXF0cmF3bXdsaGttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NDkyMCwiZXhwIjoyMDcyNDMwOTIwfQ.Jz5KmUk-5UgMpXR-kXnV4IOCBSD6VppdUI2Xb2zEmpk';

// Criar cliente Supabase com service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('Limpando usuários existentes...');

    // Limpar usuários existentes com esse email
    await supabase.from('usuarios').delete().eq('email', 'clinicaresilienceofc@gmail.com');

    // Buscar e deletar da auth.users
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users?.find(u => u.email === 'clinicaresilienceofc@gmail.com');

    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log('Usuário antigo deletado');
    }

    console.log('Criando novo usuário admin...');

    // Criar usuário na auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'clinicaresilienceofc@gmail.com',
      password: 'bloco5AP1#@',
      email_confirm: true
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return;
    }

    console.log('Usuário criado na auth:', authUser.user.id);

    // Criar na tabela usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert({
        id: authUser.user.id,
        nome: 'Administrador',
        email: 'clinicaresilienceofc@gmail.com',
        tipo_usuario: 'administrador',
        ativo: true,
        primeiro_acesso: false,
        autenticado: true,
        boas_vindas: false
      });

    if (userError) {
      console.error('Erro ao criar registro:', userError);
      return;
    }

    console.log('\n✅ USUÁRIO ADMIN CRIADO COM SUCESSO!');
    console.log('================================');
    console.log('Email: clinicaresilienceofc@gmail.com');
    console.log('Senha: bloco5AP1#@');
    console.log('Tipo: Administrador');
    console.log('================================\n');

  } catch (error) {
    console.error('Erro:', error);
  }
}

createAdminUser();