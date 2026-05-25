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

interface DocenteLayoutProps {
  children: ReactNode;
}

export default async function DocenteLayout({ children }: DocenteLayoutProps) {
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
      <SidebarLayout panelType="docente">{children}</SidebarLayout>
    </HydrationBoundary>
  );
}
