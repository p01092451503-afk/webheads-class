import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PageLoading from "@/components/PageLoading";
import SiteFooter from "@/components/SiteFooter";

/**
 * 관리자 > 디자인 관리 > 정적 페이지에서 등록한 문서를 실제 사용자 화면으로 노출한다.
 * 비공개 페이지는 관리자만 조회 가능(RLS)하므로 미리보기 용도로도 사용된다.
 */
const StaticPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["static-page", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("static_pages")
        .select("title, content, meta_description, is_published")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (page?.title) document.title = page.title;
    if (page?.meta_description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", page.meta_description);
    }
  }, [page?.title, page?.meta_description]);

  if (isLoading) return <PageLoading />;

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <FileWarning className="h-10 w-10 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            주소가 잘못되었거나 아직 공개되지 않은 페이지입니다.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 min-w-0">
        {!page.is_published && (
          <p className="mb-6 rounded-lg border border-dashed px-4 py-2 text-xs text-muted-foreground">
            비공개 상태입니다. 관리자에게만 보이는 미리보기 화면입니다.
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{page.title}</h1>
        <article
          className="prose prose-neutral dark:prose-invert max-w-none mt-8 whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: page.content || "" }}
        />
      </main>
      <SiteFooter />
    </div>
  );
};

export default StaticPage;
