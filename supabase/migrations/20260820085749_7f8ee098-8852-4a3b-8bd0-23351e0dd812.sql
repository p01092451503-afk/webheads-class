ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS mail_order_number text,
  ADD COLUMN IF NOT EXISTS fax_number text,
  ADD COLUMN IF NOT EXISTS postal_code text;

-- 모든 강의의 created_at 이 동일하여 최신순/오래된순 정렬 결과가 같았던 문제 해결
WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY title) AS rn
  FROM public.courses
)
UPDATE public.courses c
SET created_at = c.created_at - (ordered.rn || ' days')::interval
FROM ordered
WHERE c.id = ordered.id;