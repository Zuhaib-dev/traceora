import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#099268',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="256" height="256" rx="64" fill="#099268"/>
          <path d="M192 160V96a16 16 0 0 0-8-13.86l-48-27.7a16 16 0 0 0-16 0l-48 27.7A16 16 0 0 0 64 96v64a16 16 0 0 0 8 13.86l48 27.7a16 16 0 0 0 16 0l48-27.7a16 16 0 0 0 8-13.86z" fill="#ffffff" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
