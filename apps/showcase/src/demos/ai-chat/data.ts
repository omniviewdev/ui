import type { ChatMessage, ArtifactData } from './types';

export const prebuiltMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'How does the React reconciler work?',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: "React's reconciler (called \"Fiber\") works by...\n\n## Key Concepts\n\n1. **Virtual DOM diffing** — React creates a lightweight copy...\n2. **Work loops** — The fiber architecture breaks rendering into units...\n3. **Reconciliation** — When state changes, React compares...\n\n```tsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c + 1)}>{count}</button>;\n}\n```\n\nThe key insight is that Fiber makes rendering interruptible...",
    thinking: { text: 'Let me think about how to explain the React reconciler clearly...', durationMs: 2100 },
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Search for recent articles about React Server Components and summarize the key points.',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'Based on my research, here are the key developments in React Server Components:\n\n1. **Server-first rendering** — RSCs render entirely on the server [1].\n2. **Zero bundle size** — Server components aren\'t included in the client bundle [2].\n3. **Async data fetching** — Components can use `async/await` directly [1][3].',
    toolCalls: [{
      id: 'tc-1', name: 'web_search', status: 'success', durationMs: 1200,
      input: 'React Server Components 2026',
      output: 'Found 3 relevant articles...',
    }],
    citations: [
      { id: 'c1', number: 1, text: 'RSCs render entirely on the server', source: 'React Blog' },
      { id: 'c2', number: 2, text: 'Zero client-side JavaScript for server components', source: 'Vercel Engineering' },
      { id: 'c3', number: 3, text: 'Native async/await in components', source: 'Dan Abramov' },
    ],
    sources: [
      { id: 's1', title: 'React Blog — Server Components Update', url: 'https://react.dev/blog/rsc', snippet: 'Server Components are a new kind of component...' },
      { id: 's2', title: 'Vercel — Understanding RSC', url: 'https://vercel.com/blog/rsc', snippet: 'Zero-bundle-size components that render...' },
      { id: 's3', title: 'Dan Abramov — RSC From Scratch', url: 'https://overreacted.io/rsc', snippet: 'Let me walk you through building...' },
    ],
  },
  {
    id: 'msg-5',
    role: 'assistant',
    content: 'Here\'s a practical example of Server Components:\n\n```tsx\n// This runs on the server\nasync function PostList() {\n  const posts = await db.posts.findMany();\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n```',
    branches: [
      {
        id: 'b1',
        content: 'Here\'s a practical example of Server Components:\n\n```tsx\n// This runs on the server\nasync function PostList() {\n  const posts = await db.posts.findMany();\n  return (\n    <ul>\n      {posts.map(p => (\n        <li key={p.id}>{p.title}</li>\n      ))}\n    </ul>\n  );\n}\n```\n\nSince `PostList` is a Server Component, the database call never reaches the client — only the rendered HTML is sent over the wire.',
      },
      {
        id: 'b2',
        content: 'Let me show you a comparison between client and server components:\n\n```tsx\n// Server Component — runs on the server, no useState/useEffect\nasync function ServerProfile({ userId }: { userId: string }) {\n  const user = await db.users.findUnique({ where: { id: userId } });\n  return <div>{user.name}</div>;\n}\n\n// Client Component — runs in the browser, can use hooks\n\'use client\';\nfunction LikeButton({ postId }: { postId: string }) {\n  const [liked, setLiked] = useState(false);\n  return <button onClick={() => setLiked(l => !l)}>{liked ? \'Liked\' : \'Like\'}</button>;\n}\n```\n\nThe key rule: Server Components can import Client Components, but not the other way around.',
      },
      {
        id: 'b3',
        content: 'Here\'s how data flows between server and client components:\n\n```tsx\n// Data fetched on server, passed as props to client\nasync function ProductPage({ id }: { id: string }) {\n  const product = await fetchProduct(id);\n  const reviews = await fetchReviews(id);\n\n  return (\n    <div>\n      <h1>{product.name}</h1>\n      <p>{product.description}</p>\n      {/* Client Component receives serializable props */}\n      <ReviewCarousel reviews={reviews} />\n      <AddToCartButton productId={product.id} />\n    </div>\n  );\n}\n```\n\nOnly serializable data (strings, numbers, arrays, plain objects) can cross the server–client boundary as props.',
      },
    ],
  },
  {
    id: 'msg-6',
    role: 'user',
    content: 'Given these files, can you write a fibonacci function in Python?',
    contextFiles: ['src/utils/math.py', 'tests/test_math.py'],
  },
];

export const replayArtifact: ArtifactData = {
  title: 'fibonacci.py',
  language: 'python',
  code: `def fib(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)


def fib_memo(n: int, memo: dict[int, int] | None = None) -> int:
    """Memoized Fibonacci for better performance."""
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]


# Example usage
if __name__ == "__main__":
    print([fib(i) for i in range(10)])
    print([fib_memo(i) for i in range(10)])`,
};

export const replayStreamedText = `Here's a fibonacci function with both a naive recursive and memoized version:

The naive version has O(2^n) time complexity, while the memoized version runs in O(n). For production code, the memoized approach or an iterative solution would be preferred.

I've also included type hints and a main block for testing.`;

export const chatSuggestions = [
  'Write a fibonacci function in Python',
  'Explain how async/await works',
  'Compare REST vs GraphQL',
];

export const followUpSuggestions = [
  'Add unit tests for the fibonacci function',
  'Convert to an iterative approach',
  'Add error handling for negative inputs',
];

export const modelOptions = [
  { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet' },
  { id: 'claude-4-opus', name: 'Claude 4 Opus' },
  { id: 'claude-4-haiku', name: 'Claude 4 Haiku' },
];
