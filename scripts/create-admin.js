const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://xozjufubqqtrawmwlhkm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvemp1ZnVicXF0cmF3bXdsaGttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NDkyMCwiZXhwIjoyMDcyNDMwOTIwfQ.Jz5KmUk-5UgMpXR-kXnV4IOCBSD6VppdUI2Xb2zEmpk';

// Criar cliente Supabase com service key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Criando usuário admin...');

    // 1. Criar usuário na auth usando Admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'clinicaresilienceofc@gmail.com',
      password: 'bloco5AP1#@',
      email_confirm: true,
      user_metadata: {
        nome: 'Administrador'
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário auth:', authError);

      // Se o usuário já existe, tentar fazer login para verificar
      if (authError.message && authError.message.includes('already been registered')) {
        console.log('Usuário já existe. Tentando atualizar senha...');

        // Buscar o usuário existente
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === 'clinicaresilienceofc@gmail.com');

        if (existingUser) {
          // Atualizar a senha
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: 'bloco5AP1#@' }
          );

          if (updateError) {
            console.error('Erro ao atualizar senha:', updateError);
            return;
          }

          console.log('✅ Senha atualizada com sucesso!');
          console.log('Email:', 'clinicaresilienceofc@gmail.com');
          console.log('Senha: bloco5AP1#@');
          return;
        }
      }
      return;
    }

    console.log('Usuário auth criado:', authUser.user.id);

    // 2. Criar registro na tabela usuarios
    const { data: usuario, error: userError } = await supabase
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
      })
      .select()
      .single();

    if (userError) {
      console.error('Erro ao criar registro de usuário:', userError);
      // Se falhar, deletar o usuário auth criado
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email:', usuario.email);
    console.log('Senha: bloco5AP1#@');
    console.log('ID:', usuario.id);

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar
createAdminUser();