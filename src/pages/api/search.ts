// src/pages/api/search.ts
import type { APIRoute } from 'astro';
import supabase from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
    const query = url.searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
        return new Response(JSON.stringify({ songs: [], blogs: [] }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Search songs
        const { data: songs, error: songsError } = await supabase
            .from('cantos')
            .select('id, titulo, autor, tono')
            .or(`titulo.ilike.%${query}%,autor.ilike.%${query}%`)
            .limit(5);

        // Search blogs
        const { data: blogs, error: blogsError } = await supabase
            .from('blogs')
            .select('id, titulo, resumen')
            .or(`titulo.ilike.%${query}%,resumen.ilike.%${query}%`)
            .limit(5);

        if (songsError) console.error('Songs search error:', songsError);
        if (blogsError) console.error('Blogs search error:', blogsError);

        return new Response(JSON.stringify({
            songs: songs || [],
            blogs: blogs || []
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'max-age=60' // Cache for 1 minute
            }
        });
    } catch (e) {
        console.error('Search error:', e);
        return new Response(JSON.stringify({ songs: [], blogs: [], error: 'Search failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
