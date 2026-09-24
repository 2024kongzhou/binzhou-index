export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://keyi.de5.net";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SITE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type Village = {
  id: number;
  name: string;
  district: string | null;
  township: string | null;
  location: string | null;
  population: string | null;
  farmland: string | null;
  surnames: string | null;
  history: string | null;
  evolution: string | null;
  remark: string | null;
  versionTag: string | null;
  sourceFile: string | null;
  status?: string | null;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  aiGenerated: boolean | null;
  createdAt: string | null;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  originalPrice: number | null;
  images: string | null;
  isSoftAd: boolean | null;
  storeName: string | null;
  storeAddress: string | null;
  storePhone: string | null;
};

export type Chronicle = {
  id: number;
  title: string;
  content: string;
  category: string | null;
  era: string | null;
  tags: string | null;
  createdAt: string | null;
};

export type HomeData = {
  stats: {
    villages: number;
    posts: number;
    products: number;
  };
  villages: Village[];
  posts: Post[];
  products: Product[];
};

export async function getHomeData(): Promise<HomeData> {
  const [statsRes, villagesRes, postsRes, productsRes] = await Promise.all([
    fetchJson<{ villages?: number; posts?: number; products?: number }>("/api/stats"),
    fetchJson<{ villages?: Village[]; pagination?: { total?: number } }>(
      "/api/villages?limit=6"
    ),
    fetchJson<{ posts?: Post[]; pagination?: { total?: number } }>("/api/posts?limit=3"),
    fetchJson<{ products?: Product[]; pagination?: { total?: number } }>(
      "/api/products"
    ),
  ]);

  const posts = postsRes?.posts || [];
  const products = productsRes?.products || [];

  return {
    stats: {
      villages: statsRes?.villages || villagesRes?.pagination?.total || villagesRes?.villages?.length || 0,
      posts: statsRes?.posts || postsRes?.pagination?.total || posts.length,
      products: statsRes?.products || productsRes?.pagination?.total || products.length,
    },
    villages: (villagesRes?.villages || []).slice(0, 6),
    posts: posts.slice(0, 3),
    products: products.slice(0, 4),
  };
}

export async function getVillageById(id: string): Promise<Village | null> {
  const data = await fetchJson<{ village?: Village; villages?: Village[] }>(
    `/api/villages?id=${encodeURIComponent(id)}`
  );
  return data?.village || data?.villages?.[0] || null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const data = await fetchJson<{ post?: Post; posts?: Post[] }>(
    `/api/posts?slug=${encodeURIComponent(slug)}`
  );
  if (data?.post) return data.post;
  return (data?.posts || []).find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const data = await fetchJson<{ product?: Product; products?: Product[] }>(
    `/api/products?id=${encodeURIComponent(id)}`
  );
  if (data?.product) return data.product;
  return (data?.products || []).find((p) => String(p.id) === id) || null;
}

export async function getVillageIds(max = 5000): Promise<string[]> {
  const ids: string[] = [];
  const pageSize = 100;
  for (let offset = 0; offset < max; offset += pageSize) {
    const data = await fetchJson<{ villages?: { id: number }[]; pagination?: { total?: number } }>(
      `/api/villages?limit=${pageSize}&offset=${offset}`
    );
    const batch = data?.villages || [];
    if (batch.length === 0) break;
    ids.push(...batch.map((v) => String(v.id)));
    if (ids.length >= (data?.pagination?.total || 0)) break;
  }
  return ids;
}

export async function getPostSlugs(): Promise<string[]> {
  const data = await fetchJson<{ posts?: { slug: string }[] }>("/api/posts");
  return (data?.posts || []).map((p) => p.slug).filter(Boolean);
}

export async function getProductIds(): Promise<string[]> {
  const data = await fetchJson<{ products?: { id: number }[] }>("/api/products");
  return (data?.products || []).map((p) => String(p.id));
}
