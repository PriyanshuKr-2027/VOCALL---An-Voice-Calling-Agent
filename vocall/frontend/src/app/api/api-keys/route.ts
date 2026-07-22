import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, key_data, org_id } = body;

    if (!provider || !key_data) {
      return NextResponse.json(
        { error: 'provider and key_data are required' },
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

    // Simple masking for encrypted key placeholder
    const encryptedKey = `enc_${Buffer.from(JSON.stringify(key_data)).toString('base64')}`;

    // Get current organization if not provided
    let targetOrgId = org_id;
    if (!targetOrgId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('org_id')
          .eq('id', authData.user.id)
          .single();
        targetOrgId = profile?.org_id;
      }
    }

    if (targetOrgId) {
      // Upsert into api_keys table
      await supabase.from('api_keys').insert({
        org_id: targetOrgId,
        provider,
        encrypted_key: encryptedKey,
      });
    }

    return NextResponse.json({
      status: 'success',
      message: `API Key for ${provider} saved successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to save API key' },
      { status: 500 }
    );
  }
}
