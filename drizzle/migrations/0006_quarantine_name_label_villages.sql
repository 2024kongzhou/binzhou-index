-- OCR field labels are not village names. Keep their original rows as drafts
-- so editors can inspect the source and recover any misplaced information.
UPDATE villages SET status='draft'
WHERE status='published' AND trim(name)='曾用名';
