const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://xozjufubqqtrawmwlhkm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvemp1ZnVicXF0cmF3bXdsaGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NTQ5MjAsImV4cCI6MjA3MjQzMDkyMH0.mzpi_gP6jL8_lYIj6XzUhb8TCK8v-btk7W9ceDmHcqY';

// Criar cliente Supabase com anon key (como o app faz)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('Testando login...');
    console.log('Email: clinicaresilienceofc@gmail.com');
    console.log('Senha: bloco5AP1#@\n');

    // Tentar fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'clinicaresilienceofc@gmail.com',
      password: 'bloco5AP1#@'
    });

    if (error) {
      console.error('❌ Erro no login:', error.message);
      return;
    }

    console.log('✅ LOGIN REALIZADO COM SUCESSO!');
    console.log('Usuário ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Token de acesso obtido');

    // Verificar dados do usuário na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userData) {
      console.log('\n📋 Dados do usuário:');
      console.log('Nome:', userData.nome);
      console.log('Tipo:', userData.tipo_usuario);
      console.log('Ativo:', userData.ativo);
      console.log('Autenticado:', userData.autenticado);
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

testLogin();