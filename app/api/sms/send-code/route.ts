import { NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const { phone, type } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Telefonní číslo je povinné' },
        { status: 400 }
      );
    }

    // Send verification code
    const result = await sendVerificationCode(
      phone,
      type || 'PHONE_VERIFICATION'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Chyba při odesílání SMS' },
        { status: 500 }
      );
    }

    // SECURITY: Never expose verification codes in responses
    // Use a separate testing endpoint or check the database directly in development
    return NextResponse.json({
      success: true,
      message: 'Ověřovací kód byl odeslán na váš telefon',
    });
  } catch (error: any) {
    console.error('Error in send-code API:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
