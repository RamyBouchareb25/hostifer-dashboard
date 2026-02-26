import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all dashboard routes — the (dashboard) route group resolves to these paths
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/deploy/:path*",
    "/activity/:path*",
    "/billing/:path*",
    "/settings/:path*",
  ],
};
