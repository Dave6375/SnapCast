import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import aj from "@/lib/arcjet";
import {detectBot, shield} from 'arcjet';
import { createMiddleware } from '@arcjet/next';

export async function middleware(request: NextRequest, response: NextResponse) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

//Protectes are app from sus applications and bots, hover over the createMiddleware, to see.
const validate = aj
    .withRule(shield({ mode: 'LIVE'}))
    .withRule(detectBot({ mode: 'LIVE', allow: ['CATEGORY:SEARCH_ENGINE', 'GOO_CRAWLER']}))

export default createMiddleware(validate);

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
};