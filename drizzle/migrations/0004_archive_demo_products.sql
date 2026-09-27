-- Product manager supports active, inactive and archived states.
-- Normalize the quarantined demo rows without removing their review history.
UPDATE products SET status='archived'
WHERE id BETWEEN 22 AND 27 AND status='draft'
  AND store_phone IN ('0543-1234567','0543-7654321','0543-8888888',
                      '0543-6666666','0543-5555555','0543-4444444');
