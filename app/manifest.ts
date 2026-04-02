import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id:               '/',
    name:             'Trivelox Trading Inc.',
    short_name:       'Trivelox',
    description:
      'Global industrial equipment trading — premium machinery, genuine spare parts, and certified technical services.',
    start_url:        '/',
    scope:            '/',
    display:          'standalone',
    background_color: '#09090b',
    theme_color:      '#09090b',
    orientation:      'portrait-primary',
    lang:             'en',
    categories:       ['business', 'productivity'],
    prefer_related_applications: false,

    icons: [
      {
        src:     '/icons/icon-192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-maskable-512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],

    // Quick-access shortcuts — appear in Android long-press menu and Windows taskbar
    shortcuts: [
      {
        name:      'Dashboard',
        url:       '/dashboard',
        description: 'Main overview',
      },
      {
        name:      'Service Jobs',
        url:       '/technician/jobs',
        description: 'My active service jobs',
      },
      {
        name:      'Support',
        url:       '/support-tickets',
        description: 'Support tickets',
      },
    ],
  }
}
