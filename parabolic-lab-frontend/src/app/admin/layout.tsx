import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchMe, ME_QUERY_KEY } from "@/fetchers/auth";
import SidebarLayout from "@/layouts/SidebarLayout";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: ME_QUERY_KEY,
      queryFn: () => fetchMe(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarLayout panelType="admin">{children}</SidebarLayout>
    </HydrationBoundary>
  );
}
