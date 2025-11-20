import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getDomainColor, type Domain } from '@/lib/domain-utils';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get('name') || 'Profil';
    const city = searchParams.get('city') || 'Praha';
    const category = searchParams.get('category') || 'HOLKY_NA_SEX';
    const age = searchParams.get('age') || '';
    const verified = searchParams.get('verified') === 'true';
    const rating = searchParams.get('rating') || '';
    const domain = (searchParams.get('domain') || 'erosko.cz') as Domain; // NEW: Domain parameter

    // Category labels in Czech
    const categoryLabels: Record<string, string> = {
      HOLKY_NA_SEX: 'Holky na sex',
      EROTICKE_MASERKY: 'Erotické masérky',
      DOMINA: 'Domina',
      DIGITALNI_SLUZBY: 'Digitální služby',
      EROTICKE_PODNIKY: 'Erotické podniky',
    };

    const categoryLabel = categoryLabels[category] || category;

    // NEW: Get domain-specific color
    const primaryColor = getDomainColor(domain);
    const siteName = domain === 'nhescort.com' ? 'NHESCORT.COM' : 'EROSKO.CZ';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a1f 50%, #2a0a2f 100%)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 25px 25px, ${primaryColor}1a 2%, transparent 0%), radial-gradient(circle at 75px 75px, ${primaryColor}1a 2%, transparent 0%)`,
              backgroundSize: '100px 100px',
              opacity: 0.3,
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}bb 100%)`,
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: 40,
                letterSpacing: '-0.02em',
              }}
            >
              {siteName}
            </div>

            {/* Profile name */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: 'white',
                marginBottom: 20,
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                maxWidth: '900px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>

            {/* Age and city */}
            <div
              style={{
                fontSize: 36,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 30,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              {age && <span>{age} let</span>}
              {age && <span style={{ color: 'rgba(219, 39, 119, 0.5)' }}>•</span>}
              <span>{city}</span>
            </div>

            {/* Category badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  background: 'rgba(219, 39, 119, 0.2)',
                  border: '2px solid rgba(219, 39, 119, 0.5)',
                  borderRadius: 999,
                  padding: '12px 32px',
                  fontSize: 28,
                  color: '#ec4899',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {categoryLabel}
              </div>

              {verified && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '2px solid rgba(34, 197, 94, 0.5)',
                    borderRadius: 999,
                    padding: '12px 32px',
                    fontSize: 28,
                    color: '#22c55e',
                    fontWeight: 600,
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Ověřený profil</span>
                </div>
              )}
            </div>

            {/* Rating */}
            {rating && parseFloat(rating) > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 32,
                  color: '#fbbf24',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span style={{ fontWeight: 700 }}>{parseFloat(rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Bottom gradient overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '200px',
              background: 'linear-gradient(to top, rgba(219, 39, 119, 0.3) 0%, transparent 100%)',
              zIndex: 0,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('OG Image Generation Error:', error);

    // Return a fallback error image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0f',
            color: 'white',
            fontSize: 40,
          }}
        >
          <div>Error generating image</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
