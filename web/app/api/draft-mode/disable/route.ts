import {draftMode} from 'next/headers'
import {NextResponse, type NextRequest} from 'next/server'

/* Quitte l'aperçu des brouillons et revient au site publié. */
export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  return NextResponse.redirect(new URL('/', request.url))
}
