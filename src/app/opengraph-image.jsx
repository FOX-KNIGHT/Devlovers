import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Devlovers | Global Hackathon & Developer Hub';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          backgroundColor: '#06080F',
          backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(0, 245, 255, 0.2), transparent 70%)',
          color: '#F8FAFC',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00F5FF, #8A2BE2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            🏆
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Devlovers
          </span>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 245, 255, 0.4)',
              background: 'rgba(0, 245, 255, 0.1)',
              color: '#00F5FF',
              fontSize: '18px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
            }}
          >
            GLOBAL
          </div>
        </div>

        <h1
          style={{
            fontSize: '56px',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: '900px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '20px',
          }}
        >
          The Universal Hub for Elite Developer Hackathons
        </h1>

        <p
          style={{
            fontSize: '24px',
            color: '#94A3B8',
            textAlign: 'center',
            maxWidth: '750px',
            lineHeight: 1.4,
          }}
        >
          Discover high-stakes challenges, build unstoppable squads, and get evaluated with AI-augmented fair judging.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '36px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00FF9D', fontSize: '18px', fontFamily: 'monospace' }}>
            <span>●</span> 6 LIVE SPRINTS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F5FF', fontSize: '18px', fontFamily: 'monospace' }}>
            <span>●</span> $1.4M+ BOUNTIES
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8A2BE2', fontSize: '18px', fontFamily: 'monospace' }}>
            <span>●</span> MCP COPILOT POWERED
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
