import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData();
    const docType = formData.get('doc_type') as string;
    const file = formData.get('file') as File;

    if (!docType || !file) {
      return NextResponse.json(
        { error: 'doc_type and file parameters are required' },
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

    // Upload to Supabase Storage private bucket 'kyc-documents'
    const fileName = `kyc_${params.id}_${Date.now()}_${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await supabase.storage
      .from('kyc-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    // Update phone_numbers record kyc_status to 'submitted'
    const { data: updated, error } = await supabase
      .from('phone_numbers')
      .update({ kyc_status: 'submitted' })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      status: 'submitted',
      message: 'KYC Document submitted successfully',
      phone: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to upload KYC document' },
      { status: 500 }
    );
  }
}
