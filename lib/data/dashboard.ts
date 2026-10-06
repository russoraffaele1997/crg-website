import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export interface DashboardStats {
  projectCount: number;
  newLeads: number;
  publishedCommunications: number;
  blogPostCount: number;
  recentUpdates: { label: string; type: string; updatedAt: string }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServiceClient();

  const [
    { count: projectCount },
    { count: newLeads },
    { count: publishedCommunications },
    { count: blogPostCount },
    { data: recentProjects },
    { data: recentComms },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("lead_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .eq("publish_status", "published"),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("title, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("communications").select("title, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("blog_posts").select("title, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const recentUpdates = [
    ...(recentProjects ?? []).map((p) => ({ label: p.title, type: "Progetto", updatedAt: p.updated_at })),
    ...(recentComms ?? []).map((c) => ({ label: c.title, type: "Comunicazione", updatedAt: c.updated_at })),
    ...(recentPosts ?? []).map((b) => ({ label: b.title, type: "Articolo", updatedAt: b.updated_at })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return {
    projectCount: projectCount ?? 0,
    newLeads: newLeads ?? 0,
    publishedCommunications: publishedCommunications ?? 0,
    blogPostCount: blogPostCount ?? 0,
    recentUpdates,
  };
}
