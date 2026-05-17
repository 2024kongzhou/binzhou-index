import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    pubDate: z.date(),
    author: z.string().default('滨州索引'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const tutorialCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    pubDate: z.date(),
    author: z.string().default('滨州索引'),
    difficulty: z.enum(['入门', '初级', '中级', '高级']).default('入门'),
    duration: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
  tutorial: tutorialCollection,
};
