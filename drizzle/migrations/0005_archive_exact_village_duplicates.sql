-- Keep the oldest URL for each exactly identical public village record.
-- Do not merge same-name entries if any substantive field differs.
UPDATE villages SET status='draft'
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY district,township,name,location,population,farmland,
                   surnames,history,evolution,remark,version_tag,source_file
      ORDER BY id
    ) AS duplicate_rank
    FROM villages WHERE status='published'
  ) WHERE duplicate_rank > 1
);
