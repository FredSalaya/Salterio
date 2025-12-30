// src/pages/api/songs.json.ts
// Este endpoint retorna todas las canciones en formato JSON
// El Service Worker lo cachea para uso offline

import type { APIRoute } from 'astro';
import supabase from '../../lib/supabase';

export const GET: APIRoute = async () => {
    try {
        const { data, error } = await supabase
            .from('cantos')
            .select('id, titulo, tono, autor, version, cuerpo, historia, pdf, fundamento_biblico, youtube_url, mp3_urls')
            .order('titulo', { ascending: true });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Failed to fetch songs' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
