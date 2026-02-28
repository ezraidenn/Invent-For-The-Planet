export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/map/:path*",
    "/listings/:path*",
    "/batches/:path*",
    "/pickup/:path*",
    "/deliver/:path*",
    "/centers/:path*",
    "/prices/:path*",
    "/wallet/:path*",
    "/profile/:path*",
    "/notifications/:path*",
  ],
};
