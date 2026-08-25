import { redirect } from 'next/navigation'

/**
 * The drop lives at /runback so it can be dropped into madebybk.com under that
 * path. If this ever gets deployed on its own domain, the root still lands
 * people on the page instead of a 404.
 */
export default function Root() {
  redirect('/runback')
}
