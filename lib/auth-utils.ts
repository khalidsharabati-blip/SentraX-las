import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { canAccessRoute } from "./permissions";

export async function getServerUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return {
    id: (session.user as any).id as string,
    name: session.user.name || "",
    email: session.user.email || "",
    role: (session.user as any).role as string,
    language: (session.user as any).language as string,
  };
}

export async function requireAuth(locale: string = "ar") {
  const user = await getServerUser();
  if (!user) redirect(`/${locale}/login`);
  return user;
}

export async function requireAccess(locale: string, pathname: string) {
  const user = await requireAuth(locale);
  if (!canAccessRoute(user.role, pathname)) {
    redirect(`/${locale}/employee-portal`);
  }
  return user;
}
