-- 清洗村庄正文里的字面量 \n，以及明显不合理的人口数字。
UPDATE villages
SET history = REPLACE(history, CHAR(92) || 'n', CHAR(10))
WHERE history LIKE '%' || CHAR(92) || 'n%';

UPDATE villages
SET evolution = REPLACE(evolution, CHAR(92) || 'n', CHAR(10))
WHERE evolution LIKE '%' || CHAR(92) || 'n%';

UPDATE villages
SET population = NULL
WHERE CAST(REPLACE(REPLACE(REPLACE(COALESCE(population, ''), '人', ''), ',', ''), ' ', '') AS INTEGER) > 20000;
