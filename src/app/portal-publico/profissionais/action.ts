'use server'

import { createClient } from "@/lib/server"

export async function getProfissional() {
    const supabase = await createClient()

    const { data } = await supabase.from('usuarios').select('*').eq('tipo_usuario', 'profissional').order('nome')
    return data
}