export interface LeetCodeProblem {
  id: number;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string;
}

// In-memory cache for all LeetCode problems (4,000+)
const problemCache = new Map<number, LeetCodeProblem>();
let hasFetchedFromRemote = false;
let isFetching = false;

// Curated Top 100+ Offline Fallback Dictionary
const OFFLINE_TOP_PROBLEMS: Array<[number, string, string, 'Easy' | 'Medium' | 'Hard']> = [
  [1, 'Two Sum', 'two-sum', 'Easy'],
  [2, 'Add Two Numbers', 'add-two-numbers', 'Medium'],
  [3, 'Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'Medium'],
  [4, 'Median of Two Sorted Arrays', 'median-of-two-sorted-arrays', 'Hard'],
  [5, 'Longest Palindromic Substring', 'longest-palindromic-substring', 'Medium'],
  [11, 'Container With Most Water', 'container-with-most-water', 'Medium'],
  [15, '3Sum', '3sum', 'Medium'],
  [19, 'Remove Nth Node From End of List', 'remove-nth-node-from-end-of-list', 'Medium'],
  [20, 'Valid Parentheses', 'valid-parentheses', 'Easy'],
  [21, 'Merge Two Sorted Lists', 'merge-two-sorted-lists', 'Easy'],
  [22, 'Generate Parentheses', 'generate-parentheses', 'Medium'],
  [23, 'Merge k Sorted Lists', 'merge-k-sorted-lists', 'Hard'],
  [33, 'Search in Rotated Sorted Array', 'search-in-rotated-sorted-array', 'Medium'],
  [39, 'Combination Sum', 'combination-sum', 'Medium'],
  [42, 'Trapping Rain Water', 'trapping-rain-water', 'Hard'],
  [46, 'Permutations', 'permutations', 'Medium'],
  [48, 'Rotate Image', 'rotate-image', 'Medium'],
  [49, 'Group Anagrams', 'group-anagrams', 'Medium'],
  [53, 'Maximum Subarray', 'maximum-subarray', 'Medium'],
  [54, 'Spiral Matrix', 'spiral-matrix', 'Medium'],
  [55, 'Jump Game', 'jump-game', 'Medium'],
  [56, 'Merge Intervals', 'merge-intervals', 'Medium'],
  [62, 'Unique Paths', 'unique-paths', 'Medium'],
  [70, 'Climbing Stairs', 'climbing-stairs', 'Easy'],
  [72, 'Edit Distance', 'edit-distance', 'Medium'],
  [74, 'Search a 2D Matrix', 'search-a-2d-matrix', 'Medium'],
  [75, 'Sort Colors', 'sort-colors', 'Medium'],
  [76, 'Minimum Window Substring', 'minimum-window-substring', 'Hard'],
  [78, 'Subsets', 'subsets', 'Medium'],
  [79, 'Word Search', 'word-search', 'Medium'],
  [84, 'Largest Rectangle in Histogram', 'largest-rectangle-in-histogram', 'Hard'],
  [94, 'Binary Tree Inorder Traversal', 'binary-tree-inorder-traversal', 'Easy'],
  [98, 'Validate Binary Search Tree', 'validate-binary-search-tree', 'Medium'],
  [100, 'Same Tree', 'same-tree', 'Easy'],
  [101, 'Symmetric Tree', 'symmetric-tree', 'Easy'],
  [102, 'Binary Tree Level Order Traversal', 'binary-tree-level-order-traversal', 'Medium'],
  [104, 'Maximum Depth of Binary Tree', 'maximum-depth-of-binary-tree', 'Easy'],
  [105, 'Construct Binary Tree from Preorder and Inorder Traversal', 'construct-binary-tree-from-preorder-and-inorder-traversal', 'Medium'],
  [110, 'Balanced Binary Tree', 'balanced-binary-tree', 'Easy'],
  [121, 'Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'Easy'],
  [124, 'Binary Tree Maximum Path Sum', 'binary-tree-maximum-path-sum', 'Hard'],
  [125, 'Valid Palindrome', 'valid-palindrome', 'Easy'],
  [128, 'Longest Consecutive Sequence', 'longest-consecutive-sequence', 'Medium'],
  [133, 'Clone Graph', 'clone-graph', 'Medium'],
  [136, 'Single Number', 'single-number', 'Easy'],
  [138, 'Copy List with Random Pointer', 'copy-list-with-random-pointer', 'Medium'],
  [139, 'Word Break', 'word-break', 'Medium'],
  [141, 'Linked List Cycle', 'linked-list-cycle', 'Easy'],
  [143, 'Reorder List', 'reorder-list', 'Medium'],
  [146, 'LRU Cache', 'lru-cache', 'Medium'],
  [150, 'Evaluate Reverse Polish Notation', 'evaluate-reverse-polish-notation', 'Medium'],
  [152, 'Maximum Product Subarray', 'maximum-product-subarray', 'Medium'],
  [153, 'Find Minimum in Rotated Sorted Array', 'find-minimum-in-rotated-sorted-array', 'Medium'],
  [155, 'Min Stack', 'min-stack', 'Medium'],
  [198, 'House Robber', 'house-robber', 'Medium'],
  [200, 'Number of Islands', 'number-of-islands', 'Medium'],
  [206, 'Reverse Linked List', 'reverse-linked-list', 'Easy'],
  [207, 'Course Schedule', 'course-schedule', 'Medium'],
  [208, 'Implement Trie (Prefix Tree)', 'implement-trie-prefix-tree', 'Medium'],
  [210, 'Course Schedule II', 'course-schedule-ii', 'Medium'],
  [215, 'Kth Largest Element in an Array', 'kth-largest-element-in-an-array', 'Medium'],
  [217, 'Contains Duplicate', 'contains-duplicate', 'Easy'],
  [226, 'Invert Binary Tree', 'invert-binary-tree', 'Easy'],
  [230, 'Kth Smallest Element in a BST', 'kth-smallest-element-in-a-bst', 'Medium'],
  [235, 'Lowest Common Ancestor of a Binary Search Tree', 'lowest-common-ancestor-of-a-binary-search-tree', 'Medium'],
  [236, 'Lowest Common Ancestor of a Binary Tree', 'lowest-common-ancestor-of-a-binary-tree', 'Medium'],
  [238, 'Product of Array Except Self', 'product-of-array-except-self', 'Medium'],
  [239, 'Sliding Window Maximum', 'sliding-window-maximum', 'Hard'],
  [242, 'Valid Anagram', 'valid-anagram', 'Easy'],
  [252, 'Meeting Rooms', 'meeting-rooms', 'Easy'],
  [253, 'Meeting Rooms II', 'meeting-rooms-ii', 'Medium'],
  [268, 'Missing Number', 'missing-number', 'Easy'],
  [271, 'Encode and Decode Strings', 'encode-and-decode-strings', 'Medium'],
  [295, 'Find Median from Data Stream', 'find-median-from-data-stream', 'Hard'],
  [300, 'Longest Increasing Subsequence', 'longest-increasing-subsequence', 'Medium'],
  [322, 'Coin Change', 'coin-change', 'Medium'],
  [347, 'Top K Frequent Elements', 'top-k-frequent-elements', 'Medium'],
  [371, 'Sum of Two Integers', 'sum-of-two-integers', 'Medium'],
  [417, 'Pacific Atlantic Water Flow', 'pacific-atlantic-water-flow', 'Medium'],
  [424, 'Longest Repeating Character Replacement', 'longest-repeating-character-replacement', 'Medium'],
  [435, 'Non-overlapping Intervals', 'non-overlapping-intervals', 'Medium'],
  [543, 'Diameter of Binary Tree', 'diameter-of-binary-tree', 'Easy'],
  [572, 'Subtree of Another Tree', 'subtree-of-another-tree', 'Easy'],
  [647, 'Palindromic Substrings', 'palindromic-substrings', 'Medium'],
  [704, 'Binary Search', 'binary-search', 'Easy'],
  [739, 'Daily Temperatures', 'daily-temperatures', 'Medium'],
  [746, 'Min Cost Climbing Stairs', 'min-cost-climbing-stairs', 'Easy'],
  [787, 'Cheapest Flights Within K Stops', 'cheapest-flights-within-k-stops', 'Medium'],
  [853, 'Car Fleet', 'car-fleet', 'Medium'],
  [875, 'Koko Eating Bananas', 'koko-eating-bananas', 'Medium'],
  [973, 'K Closest Points to Origin', 'k-closest-points-to-origin', 'Medium'],
  [981, 'Time Based Key-Value Store', 'time-based-key-value-store', 'Medium'],
  [994, 'Rotting Oranges', 'rotting-oranges', 'Medium'],
  [1143, 'Longest Common Subsequence', 'longest-common-subsequence', 'Medium'],
];

// Initialize offline cache
for (const [id, title, slug, diff] of OFFLINE_TOP_PROBLEMS) {
  problemCache.set(id, {
    id,
    title,
    titleSlug: slug,
    difficulty: diff,
    url: `https://leetcode.com/problems/${slug}/`,
  });
}

// Fetch all 4,000+ problems from LeetCode problemset API asynchronously
export async function populateLeetCodeProblemCache(): Promise<void> {
  if (hasFetchedFromRemote || isFetching) return;
  isFetching = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch('https://leetcode.com/api/problems/all/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[LeetCode Resolver] Remote fetch returned ${response.status}; using local cache`);
      return;
    }

    const data: any = await response.json();
    if (data && Array.isArray(data.stat_status_pairs)) {
      for (const pair of data.stat_status_pairs) {
        const id = pair.stat?.frontend_question_id;
        const title = pair.stat?.question__title;
        const slug = pair.stat?.question__title_slug;
        const level = pair.difficulty?.level;
        if (id && title && slug) {
          const diff: 'Easy' | 'Medium' | 'Hard' =
            level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
          problemCache.set(Number(id), {
            id: Number(id),
            title,
            titleSlug: slug,
            difficulty: diff,
            url: `https://leetcode.com/problems/${slug}/`,
          });
        }
      }
      hasFetchedFromRemote = true;
    }
  } catch (err: any) {
    console.warn('[LeetCode Resolver] Remote fetch failed, falling back to local dataset:', err?.message || err);
  } finally {
    isFetching = false;
  }
}

export async function resolveLeetCodeProblem(idOrQuery: string | number): Promise<LeetCodeProblem | null> {
  const numId = typeof idOrQuery === 'number' ? idOrQuery : parseInt(String(idOrQuery).trim(), 10);

  if (!isNaN(numId)) {
    const cached = problemCache.get(numId);
    if (cached) return cached;
  }

  // If not found in cache and remote fetch hasn't run yet, try populating
  if (!hasFetchedFromRemote && !isFetching) {
    await populateLeetCodeProblemCache();
  }

  if (!isNaN(numId)) {
    return problemCache.get(numId) || null;
  }

  // If query is a title or title slug string
  const queryStr = String(idOrQuery).toLowerCase().trim();
  for (const p of problemCache.values()) {
    if (p.title.toLowerCase() === queryStr || p.titleSlug.toLowerCase() === queryStr) {
      return p;
    }
  }

  return null;
}
