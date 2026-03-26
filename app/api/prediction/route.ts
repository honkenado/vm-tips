import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ prediction: null });
  }

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id')
    .eq('slug', 'world-cup-2026')
    .single();

  if (!tournament) {
    return NextResponse.json({ prediction: null });
  }

  const { data } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .eq('tournament_id', tournament.id)
    .maybeSingle();

  return NextResponse.json({ prediction: data });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const body = await req.json();
  const { groups, knockout } = body;

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id')
    .eq('slug', 'world-cup-2026')
    .single();

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id: user.id,
        tournament_id: tournament.id,
        group_stage: groups,
        knockout,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,tournament_id',
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ prediction: data });
}