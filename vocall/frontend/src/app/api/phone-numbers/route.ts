import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { number, provider, agent_id } = body;

    if (!number || !provider) {
      return NextResponse.json(
        { error: 'number and provider are required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get current org_id
    const { data: authData } = await supabase.auth.getUser();
    let org_id: string | null = null;
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', authData.user.id)
        .single();
      org_id = profile?.org_id || null;
    }

    if (!org_id) {
      return NextResponse.json(
        { error: 'Organization ID not found. Please log in.' },
        { status: 401 }
      );
    }

    const { data: newPhone, error } = await supabase
      .from('phone_numbers')
      .insert({
        org_id,
        agent_id: agent_id || null,
        number,
        provider,
        kyc_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newPhone);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to provision phone number' },
      { status: 500 }
    );
  }
}
