-- Reversible publication cleanup. Preserve every original row for editorial review.
-- Township names and OCR sentence fragments do not belong in a village directory.
UPDATE villages SET status='draft'
WHERE status='published' AND (
  name LIKE '%镇' OR name LIKE '%乡' OR name LIKE '%街道'
);

-- These six storefront rows came from demo seed data and have no product images.
UPDATE products SET status='draft'
WHERE id BETWEEN 22 AND 27 AND status='active' AND (images IS NULL OR trim(images)='')
  AND store_phone IN ('0543-1234567','0543-7654321','0543-8888888',
                      '0543-6666666','0543-5555555','0543-4444444');

-- Published must mean publicly readable. Keep the latest valid title and archive
-- the legacy rows that the public article pages already rejected.
UPDATE posts SET status='archived'
WHERE status='published' AND (
  title LIKE '%??%' OR content LIKE '%??%' OR length(content) NOT BETWEEN 1500 AND 3000
  OR cover_image IS NULL OR cover_image=''
  OR id NOT IN (SELECT MAX(id) FROM posts WHERE status='published' GROUP BY title)
);
