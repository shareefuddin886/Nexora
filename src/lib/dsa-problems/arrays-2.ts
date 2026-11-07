import { args, out } from "@/lib/tracks/types";
import type { DsaProblem } from "./types";

// Arrays, part 2: counting & hashing, prefix sums & Kadane, and harder two-pointer problems.

export const arraysPart2: DsaProblem[] = [
  /* ------------------------------------------------------------------ */
  {
    id: "majority-element",
    leetcode: 169,
    title: "Majority Element",
    difficulty: "Easy",
    topicId: "arrays",
    group: "Counting & Hashing",
    pattern: "Moore's Voting Algorithm",
    statement: [
      "Given an array `nums` of size `n`, return the majority element: the element that appears **more than** `⌊n / 2⌋` times.",
      "You may assume the majority element always exists.",
    ],
    examples: [
      { input: args([3, 2, 3]), output: "3" },
      { input: args([2, 2, 1, 1, 1, 2, 2]), output: "2" },
    ],
    constraints: [
      "1 <= n <= 5 * 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "The majority element always exists.",
    ],
    functionName: "majorityElement",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number" },
    testCases: [
      { input: args([3, 2, 3]), expectedOutput: out(3) },
      { input: args([2, 2, 1, 1, 1, 2, 2]), expectedOutput: out(2) },
      { input: args([1]), expectedOutput: out(1), isHidden: true },
      { input: args([6, 5, 5]), expectedOutput: out(5), isHidden: true },
      { input: args([4, 4, 4, 1, 2]), expectedOutput: out(4), isHidden: true },
      { input: args([-1, -1, 7]), expectedOutput: out(-1), isHidden: true },
    ],
    hints: [
      "Counting every element with a hash map works. Can you avoid the extra memory?",
      "Pair up each majority element with a different element and cancel them. What is left over?",
    ],
    check: {
      prompt: "nums = [1, 3, 3, 2, 3]. What is returned?",
      options: ["1", "2", "3", "No majority"],
      correctIndex: 2,
      explanation: "3 appears 3 times, which is more than ⌊5/2⌋ = 2.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "For each element, count how many times it appears.",
        intuition: [
          "Pick each value in turn and count its occurrences with a second loop. The first value whose count exceeds n / 2 is the answer.",
        ],
        steps: [
          "For each `i`, count elements equal to `nums[i]`.",
          "If the count is greater than `n / 2`, return `nums[i]`.",
        ],
        code: {
          javascript: `var majorityElement = function(nums) {
    const n = nums.length;
    for (const candidate of nums) {
        let count = 0;
        for (const x of nums) if (x === candidate) count++;
        if (count > Math.floor(n / 2)) return candidate;
    }
    return -1;
};`,
          python: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        n = len(nums)
        for candidate in nums:
            if nums.count(candidate) > n // 2:
                return candidate
        return -1`,
          java: `class Solution {
    public int majorityElement(int[] nums) {
        int n = nums.length;
        for (int candidate : nums) {
            int count = 0;
            for (int x : nums) if (x == candidate) count++;
            if (count > n / 2) return candidate;
        }
        return -1;
    }
}`,
          cpp: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int n = nums.size();
        for (int candidate : nums) {
            int count = 0;
            for (int x : nums) if (x == candidate) count++;
            if (count > n / 2) return candidate;
        }
        return -1;
    }
};`,
        },
        time: "O(n²)",
        space: "O(1)",
        complexityNote: "Up to n candidates, each counted in O(n).",
      },
      {
        name: "Better",
        summary: "Count frequencies in a hash map.",
        intuition: [
          "A hash map gives O(1) counting, so one pass is enough. Return as soon as a count passes n / 2.",
        ],
        steps: ["For each `x`, increment `freq[x]`.", "If `freq[x] > n / 2`, return `x`."],
        code: {
          javascript: `var majorityElement = function(nums) {
    const freq = new Map();
    for (const x of nums) {
        const c = (freq.get(x) ?? 0) + 1;
        freq.set(x, c);
        if (c > nums.length / 2) return x;
    }
    return -1;
};`,
          python: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        freq = {}
        for x in nums:
            freq[x] = freq.get(x, 0) + 1
            if freq[x] > len(nums) // 2:
                return x
        return -1`,
          java: `class Solution {
    public int majorityElement(int[] nums) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : nums) {
            int c = freq.merge(x, 1, Integer::sum);
            if (c > nums.length / 2) return x;
        }
        return -1;
    }
}`,
          cpp: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        unordered_map<int, int> freq;
        for (int x : nums) {
            if (++freq[x] > (int)nums.size() / 2) return x;
        }
        return -1;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote: "One pass, but the map may hold up to n/2 distinct values.",
      },
      {
        name: "Optimal",
        summary:
          "Moore's Voting: keep a candidate and a count; different values cancel each other out.",
        intuition: [
          "Imagine an election: each element votes for itself. Keep a current `candidate` and a `count`. A matching vote adds one; a different vote cancels one. When the count hits zero, the next element becomes the new candidate.",
          "The majority element has more votes than all other elements combined, so it can never be fully cancelled. It is the candidate left standing at the end.",
        ],
        steps: [
          "Set `count = 0`.",
          "For each `x`: if `count == 0`, set `candidate = x`.",
          "If `x == candidate`, `count++`; otherwise `count--`.",
          "Return `candidate` (guaranteed to be the majority here; otherwise verify with a second pass).",
        ],
        dryRun: {
          title: "nums = [2, 2, 1, 1, 1, 2, 2]",
          columns: ["i", "x", "candidate", "count", "Why"],
          rows: [
            ["0", "2", "2", "1", "count was 0: new candidate"],
            ["1", "2", "2", "2", "same vote"],
            ["2", "1", "2", "1", "different: cancel one"],
            ["3", "1", "2", "0", "different: cancel one"],
            ["4", "1", "1", "1", "count was 0: new candidate"],
            ["5", "2", "1", "0", "different: cancel one"],
            ["6", "2", "2", "1", "count was 0: new candidate"],
          ],
          result: "candidate = 2",
        },
        code: {
          javascript: `var majorityElement = function(nums) {
    let candidate = 0, count = 0;
    for (const x of nums) {
        if (count === 0) candidate = x;
        count += x === candidate ? 1 : -1;
    }
    return candidate;
};`,
          python: `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate, count = 0, 0
        for x in nums:
            if count == 0:
                candidate = x
            count += 1 if x == candidate else -1
        return candidate`,
          java: `class Solution {
    public int majorityElement(int[] nums) {
        int candidate = 0, count = 0;
        for (int x : nums) {
            if (count == 0) candidate = x;
            count += (x == candidate) ? 1 : -1;
        }
        return candidate;
    }
}`,
          cpp: `class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int candidate = 0, count = 0;
        for (int x : nums) {
            if (count == 0) candidate = x;
            count += (x == candidate) ? 1 : -1;
        }
        return candidate;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "One pass with two variables.",
      },
    ],
    doubts: [
      {
        q: "What if a majority element is not guaranteed?",
        a: "Moore's algorithm then gives a candidate, not an answer. Do a second pass to count the candidate and return it only if its count is greater than n / 2.",
      },
      {
        q: "Why can't the majority element be cancelled completely?",
        a: "Every cancellation removes one majority vote and one other vote. Since the majority has more votes than everything else combined, it runs out of opponents first.",
      },
    ],
    followUps: [
      "Majority Element II (LeetCode 229): find all elements appearing more than ⌊n/3⌋ times. Use two candidates.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "longest-consecutive-sequence",
    leetcode: 128,
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    topicId: "arrays",
    group: "Counting & Hashing",
    pattern: "Hash set, start only at sequence beginnings",
    statement: [
      "Given an unsorted array of integers `nums`, return the length of the longest sequence of consecutive integers (like 3, 4, 5, 6) whose values all appear in the array.",
      "The values can appear in any order in the array. Aim for an O(n) algorithm.",
    ],
    examples: [
      {
        input: args([100, 4, 200, 1, 3, 2]),
        output: "4",
        explanation: "The longest consecutive sequence is [1, 2, 3, 4].",
      },
      { input: args([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), output: "9" },
    ],
    constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    functionName: "longestConsecutive",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number" },
    testCases: [
      { input: args([100, 4, 200, 1, 3, 2]), expectedOutput: out(4) },
      { input: args([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]), expectedOutput: out(9) },
      { input: args([]), expectedOutput: out(0), isHidden: true },
      { input: args([1, 2, 0, 1]), expectedOutput: out(3), isHidden: true },
      { input: args([9]), expectedOutput: out(1), isHidden: true },
      { input: args([-1, -2, 5, 6, 7, 8]), expectedOutput: out(4), isHidden: true },
    ],
    hints: [
      "Sorting makes consecutive values adjacent. Can you avoid sorting?",
      "Put all values in a set so you can ask 'is x + 1 present?' in O(1).",
      "Only start counting from a value x when x - 1 is NOT in the set. Why does that keep it O(n)?",
    ],
    check: {
      prompt: "nums = [10, 5, 12, 3, 11, 4]. What is returned?",
      options: ["2", "3", "4", "6"],
      correctIndex: 1,
      explanation: "Both [3,4,5] and [10,11,12] have length 3.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "From every value, keep looking for the next value with a linear search.",
        intuition: [
          "For each x, check whether x + 1 exists by scanning the array, then x + 2, and so on. The longest chain found is the answer.",
        ],
        steps: [
          "For each `x`, set `length = 1` and `next = x + 1`.",
          "While `next` is found by scanning the array, increase `length` and `next`.",
          "Track the maximum length.",
        ],
        code: {
          javascript: `var longestConsecutive = function(nums) {
    let best = 0;
    for (const x of nums) {
        let next = x + 1, length = 1;
        while (nums.includes(next)) {
            next++;
            length++;
        }
        best = Math.max(best, length);
    }
    return best;
};`,
          python: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        best = 0
        for x in nums:
            nxt, length = x + 1, 1
            while nxt in nums:
                nxt += 1
                length += 1
            best = max(best, length)
        return best`,
          java: `class Solution {
    public int longestConsecutive(int[] nums) {
        int best = 0;
        for (int x : nums) {
            int next = x + 1, length = 1;
            while (contains(nums, next)) {
                next++;
                length++;
            }
            best = Math.max(best, length);
        }
        return best;
    }

    private boolean contains(int[] nums, int target) {
        for (int v : nums) if (v == target) return true;
        return false;
    }
}`,
          cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        int best = 0;
        for (int x : nums) {
            int next = x + 1, length = 1;
            while (find(nums.begin(), nums.end(), next) != nums.end()) {
                next++;
                length++;
            }
            best = max(best, length);
        }
        return best;
    }
};`,
        },
        time: "O(n³)",
        space: "O(1)",
        complexityNote: "Up to n starts, each chain up to n long, each step a linear search of n.",
      },
      {
        name: "Better",
        summary: "Sort, then count runs of values that increase by exactly one.",
        intuition: [
          "After sorting, a consecutive sequence appears as neighbours differing by 1. Duplicates should be skipped without breaking the run.",
        ],
        steps: [
          "Sort the array.",
          "Walk through it: if the current value equals `last + 1`, extend the run; if it equals `last`, skip it; otherwise start a new run.",
          "Track the longest run.",
        ],
        code: {
          javascript: `var longestConsecutive = function(nums) {
    if (nums.length === 0) return 0;
    const sorted = [...nums].sort((a, b) => a - b);
    let best = 1, run = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1]) continue;
        run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
        best = Math.max(best, run);
    }
    return best;
};`,
          python: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        if not nums:
            return 0
        s = sorted(nums)
        best = run = 1
        for i in range(1, len(s)):
            if s[i] == s[i - 1]:
                continue
            run = run + 1 if s[i] == s[i - 1] + 1 else 1
            best = max(best, run)
        return best`,
          java: `class Solution {
    public int longestConsecutive(int[] nums) {
        if (nums.length == 0) return 0;
        int[] s = nums.clone();
        Arrays.sort(s);
        int best = 1, run = 1;
        for (int i = 1; i < s.length; i++) {
            if (s[i] == s[i - 1]) continue;
            run = (s[i] == s[i - 1] + 1) ? run + 1 : 1;
            best = Math.max(best, run);
        }
        return best;
    }
}`,
          cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        if (nums.empty()) return 0;
        vector<int> s = nums;
        sort(s.begin(), s.end());
        int best = 1, run = 1;
        for (size_t i = 1; i < s.size(); i++) {
            if (s[i] == s[i - 1]) continue;
            run = (s[i] == s[i - 1] + 1) ? run + 1 : 1;
            best = max(best, run);
        }
        return best;
    }
};`,
        },
        time: "O(n log n)",
        space: "O(n)",
        complexityNote: "Sorting dominates; we sort a copy.",
      },
      {
        name: "Optimal",
        summary: "Use a set and only count upward from numbers that start a sequence.",
        intuition: [
          "A value x starts a sequence exactly when x - 1 is not present. From each start, count x + 1, x + 2, … using O(1) set lookups.",
          "Every number is visited at most twice in total (once in the outer loop, once while extending its own sequence), so the whole algorithm is linear even though it has a nested loop.",
        ],
        steps: [
          "Insert all numbers into a set.",
          "For each `x` in the set: if `x - 1` is in the set, skip it (not a start).",
          "Otherwise count `length` while `x + length` is in the set.",
          "Track the maximum length.",
        ],
        dryRun: {
          title: "nums = [100, 4, 200, 1, 3, 2]   set = {100, 4, 200, 1, 3, 2}",
          columns: ["x", "x − 1 in set?", "Start?", "Counted", "best"],
          rows: [
            ["100", "99: no", "yes", "100 → length 1", "1"],
            ["4", "3: yes", "no, skip", "—", "1"],
            ["200", "199: no", "yes", "200 → length 1", "1"],
            ["1", "0: no", "yes", "1, 2, 3, 4 → length 4", "4"],
            ["3", "2: yes", "no, skip", "—", "4"],
            ["2", "1: yes", "no, skip", "—", "4"],
          ],
          result: "best = 4",
        },
        code: {
          javascript: `var longestConsecutive = function(nums) {
    const set = new Set(nums);
    let best = 0;
    for (const x of set) {
        if (set.has(x - 1)) continue;
        let length = 1;
        while (set.has(x + length)) length++;
        best = Math.max(best, length);
    }
    return best;
};`,
          python: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        values = set(nums)
        best = 0
        for x in values:
            if x - 1 in values:
                continue
            length = 1
            while x + length in values:
                length += 1
            best = max(best, length)
        return best`,
          java: `class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) set.add(x);
        int best = 0;
        for (int x : set) {
            if (set.contains(x - 1)) continue;
            int length = 1;
            while (set.contains(x + length)) length++;
            best = Math.max(best, length);
        }
        return best;
    }
}`,
          cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> set(nums.begin(), nums.end());
        int best = 0;
        for (int x : set) {
            if (set.count(x - 1)) continue;
            int length = 1;
            while (set.count(x + length)) length++;
            best = max(best, length);
        }
        return best;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote:
          "Building the set is O(n); each value is extended over at most once because only sequence starts begin a count.",
      },
    ],
    doubts: [
      {
        q: "There is a while loop inside a for loop. Why isn't it O(n²)?",
        a: "The inner loop only runs from sequence starts, and each value belongs to exactly one sequence. Across all starts, the inner loop runs at most n times in total.",
      },
      {
        q: "Why iterate over the set instead of the array?",
        a: "With many duplicates, iterating the array could start the same sequence repeatedly. Iterating the set visits each distinct value once.",
      },
    ],
    followUps: [
      "Return the sequence itself, not just its length.",
      "Solve it with Union-Find, grouping x with x + 1.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "subarray-sum-equals-k",
    leetcode: 560,
    title: "Subarray Sum Equals K",
    difficulty: "Medium",
    topicId: "arrays",
    group: "Counting & Hashing",
    pattern: "Prefix sums + hash map",
    statement: [
      "Given an integer array `nums` and an integer `k`, return the total number of **subarrays** whose sum equals `k`.",
      "A subarray is a contiguous, non-empty part of the array. Values may be negative.",
    ],
    examples: [
      {
        input: args([1, 1, 1], 2),
        output: "2",
        explanation: "[1,1] starting at index 0 and [1,1] starting at index 1.",
      },
      { input: args([1, 2, 3], 3), output: "2", explanation: "[1,2] and [3]." },
    ],
    constraints: ["1 <= nums.length <= 2 * 10^4", "-1000 <= nums[i] <= 1000", "-10^7 <= k <= 10^7"],
    functionName: "subarraySum",
    signature: {
      params: [
        { name: "nums", type: "number[]" },
        { name: "k", type: "number" },
      ],
      returnType: "number",
    },
    testCases: [
      { input: args([1, 1, 1], 2), expectedOutput: out(2) },
      { input: args([1, 2, 3], 3), expectedOutput: out(2) },
      { input: args([1], 0), expectedOutput: out(0), isHidden: true },
      { input: args([1, -1, 0], 0), expectedOutput: out(3), isHidden: true },
      { input: args([3, 4, 7, 2, -3, 1, 4, 2], 7), expectedOutput: out(4), isHidden: true },
      { input: args([0, 0, 0], 0), expectedOutput: out(6), isHidden: true },
    ],
    hints: [
      "The sum of nums[i..j] equals prefix[j] − prefix[i − 1].",
      "While scanning, you want to know: how many earlier prefix sums equal currentPrefix − k?",
      "Store counts of prefix sums seen so far in a hash map. Start with {0: 1}.",
    ],
    check: {
      prompt: "nums = [2, -2, 2], k = 2. What is returned?",
      options: ["1", "2", "3", "4"],
      correctIndex: 2,
      explanation: "[2] at index 0, [2] at index 2, and [2,-2,2]. That is 3 subarrays.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Fix a start, extend the end, and keep a running sum.",
        intuition: [
          "Every subarray has a start i and end j. Fixing i and growing j lets us update the sum in O(1) per step instead of re-adding the whole subarray.",
        ],
        steps: [
          "For each start `i`, set `sum = 0`.",
          "For each end `j >= i`, add `nums[j]` to `sum`; if `sum == k`, count it.",
        ],
        code: {
          javascript: `var subarraySum = function(nums, k) {
    let count = 0;
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum === k) count++;
        }
    }
    return count;
};`,
          python: `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        count = 0
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):
                total += nums[j]
                if total == k:
                    count += 1
        return count`,
          java: `class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                if (sum == k) count++;
            }
        }
        return count;
    }
}`,
          cpp: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int count = 0;
        for (size_t i = 0; i < nums.size(); i++) {
            int sum = 0;
            for (size_t j = i; j < nums.size(); j++) {
                sum += nums[j];
                if (sum == k) count++;
            }
        }
        return count;
    }
};`,
        },
        time: "O(n²)",
        space: "O(1)",
        complexityNote: "All n(n+1)/2 subarrays are visited once each.",
      },
      {
        name: "Optimal",
        summary: "Count earlier prefix sums equal to `prefix − k` with a hash map.",
        intuition: [
          "Let `prefix` be the sum of everything up to the current index. A subarray ending here sums to k exactly when some earlier prefix equals `prefix − k`, because the part between them is what remains.",
          "So while scanning, keep a map from prefix sum to how many times it has occurred. At each index, add `map[prefix − k]` to the answer, then record the current prefix. The map starts with `{0: 1}` to count subarrays that begin at index 0.",
        ],
        steps: [
          "Set `count = 0`, `prefix = 0`, `seen = {0: 1}`.",
          "For each `x`: `prefix += x`.",
          "`count += seen[prefix − k]` (0 if absent).",
          "`seen[prefix]++`.",
          "Return `count`.",
        ],
        dryRun: {
          title: "nums = [1, 2, 3], k = 3",
          columns: ["x", "prefix", "prefix − k", "Found in seen", "count", "seen after"],
          rows: [
            ["—", "0", "—", "—", "0", "{0:1}"],
            ["1", "1", "-2", "0", "0", "{0:1, 1:1}"],
            ["2", "3", "0", "1  (subarray [1,2])", "1", "{0:1, 1:1, 3:1}"],
            ["3", "6", "3", "1  (subarray [3])", "2", "{0:1, 1:1, 3:1, 6:1}"],
          ],
          result: "count = 2",
        },
        code: {
          javascript: `var subarraySum = function(nums, k) {
    const seen = new Map([[0, 1]]);
    let prefix = 0, count = 0;
    for (const x of nums) {
        prefix += x;
        count += seen.get(prefix - k) ?? 0;
        seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
    }
    return count;
};`,
          python: `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        seen = {0: 1}
        prefix = count = 0
        for x in nums:
            prefix += x
            count += seen.get(prefix - k, 0)
            seen[prefix] = seen.get(prefix, 0) + 1
        return count`,
          java: `class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> seen = new HashMap<>();
        seen.put(0, 1);
        int prefix = 0, count = 0;
        for (int x : nums) {
            prefix += x;
            count += seen.getOrDefault(prefix - k, 0);
            seen.merge(prefix, 1, Integer::sum);
        }
        return count;
    }
}`,
          cpp: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> seen{{0, 1}};
        int prefix = 0, count = 0;
        for (int x : nums) {
            prefix += x;
            auto it = seen.find(prefix - k);
            if (it != seen.end()) count += it->second;
            seen[prefix]++;
        }
        return count;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote: "One pass with O(1) map operations; the map can hold up to n prefix sums.",
      },
    ],
    doubts: [
      {
        q: "Why does the map start with {0: 1}?",
        a: "It represents the empty prefix before the array. Without it, a subarray starting at index 0 whose sum is k (so prefix − k = 0) would not be counted.",
      },
      {
        q: "Why not use a sliding window?",
        a: "Sliding windows need the sum to grow when the window grows. With negative numbers that is not true, so shrinking the window may skip valid answers. Prefix sums work with any values.",
      },
    ],
    followUps: [
      "Longest subarray with sum k (store the first index of each prefix instead of a count).",
      "Count subarrays whose sum is divisible by k (LeetCode 974).",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "maximum-subarray",
    leetcode: 53,
    title: "Maximum Subarray",
    difficulty: "Medium",
    topicId: "arrays",
    group: "Prefix Sums & Kadane",
    pattern: "Kadane's Algorithm",
    statement: [
      "Given an integer array `nums`, find the contiguous subarray (containing at least one number) with the largest sum and return that sum.",
    ],
    examples: [
      {
        input: args([-2, 1, -3, 4, -1, 2, 1, -5, 4]),
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum, 6.",
      },
      { input: args([1]), output: "1" },
      { input: args([5, 4, -1, 7, 8]), output: "23" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    functionName: "maxSubArray",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number" },
    testCases: [
      { input: args([-2, 1, -3, 4, -1, 2, 1, -5, 4]), expectedOutput: out(6) },
      { input: args([1]), expectedOutput: out(1) },
      { input: args([5, 4, -1, 7, 8]), expectedOutput: out(23) },
      { input: args([-3, -1, -2]), expectedOutput: out(-1), isHidden: true },
      { input: args([0, -1, 0]), expectedOutput: out(0), isHidden: true },
      { input: args([2, -1, 2, -1, 2]), expectedOutput: out(4), isHidden: true },
    ],
    hints: [
      "If the sum of the subarray so far is negative, would it ever help to keep it?",
      "Keep a running sum. Reset it to 0 when it drops below 0, and record the best sum seen.",
    ],
    check: {
      prompt: "nums = [-1, 3, -2, 4, -10, 2]. What is returned?",
      options: ["4", "5", "6", "7"],
      correctIndex: 1,
      explanation: "The best subarray is [3,-2,4] with sum 5.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Try every start; extend the end with a running sum.",
        intuition: [
          "Check the sum of every subarray. Fixing the start and growing the end lets us update the sum in O(1) per step.",
        ],
        steps: [
          "For each start `i`, set `sum = 0`.",
          "For each end `j >= i`: `sum += nums[j]`, `best = max(best, sum)`.",
        ],
        code: {
          javascript: `var maxSubArray = function(nums) {
    let best = -Infinity;
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum += nums[j];
            best = Math.max(best, sum);
        }
    }
    return best;
};`,
          python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        best = float("-inf")
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):
                total += nums[j]
                best = max(best, total)
        return best`,
          java: `class Solution {
    public int maxSubArray(int[] nums) {
        int best = Integer.MIN_VALUE;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                best = Math.max(best, sum);
            }
        }
        return best;
    }
}`,
          cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = INT_MIN;
        for (size_t i = 0; i < nums.size(); i++) {
            int sum = 0;
            for (size_t j = i; j < nums.size(); j++) {
                sum += nums[j];
                best = max(best, sum);
            }
        }
        return best;
    }
};`,
        },
        time: "O(n²)",
        space: "O(1)",
        complexityNote: "All n(n+1)/2 subarrays are summed incrementally.",
      },
      {
        name: "Optimal",
        summary: "Kadane: carry the running sum forward only while it is positive.",
        intuition: [
          "Scan left to right with a running sum. A negative running sum can only make any future subarray smaller, so we drop it and start fresh from the next element.",
          "Update the best answer **before** resetting, so arrays of all negative numbers return their largest element.",
        ],
        steps: [
          "Set `sum = 0`, `best = -∞`.",
          "For each `x`: `sum += x`; `best = max(best, sum)`.",
          "If `sum < 0`, set `sum = 0`.",
          "Return `best`.",
        ],
        dryRun: {
          title: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
          columns: ["x", "sum after adding", "best", "Reset?"],
          rows: [
            ["-2", "-2", "-2", "yes → 0"],
            ["1", "1", "1", "no"],
            ["-3", "-2", "1", "yes → 0"],
            ["4", "4", "4", "no"],
            ["-1", "3", "4", "no"],
            ["2", "5", "5", "no"],
            ["1", "6", "6", "no"],
            ["-5", "1", "6", "no"],
            ["4", "5", "6", "no"],
          ],
          result: "best = 6 (subarray [4, -1, 2, 1])",
        },
        code: {
          javascript: `var maxSubArray = function(nums) {
    let sum = 0, best = -Infinity;
    for (const x of nums) {
        sum += x;
        best = Math.max(best, sum);
        if (sum < 0) sum = 0;
    }
    return best;
};`,
          python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        total, best = 0, float("-inf")
        for x in nums:
            total += x
            best = max(best, total)
            if total < 0:
                total = 0
        return best`,
          java: `class Solution {
    public int maxSubArray(int[] nums) {
        int sum = 0, best = Integer.MIN_VALUE;
        for (int x : nums) {
            sum += x;
            best = Math.max(best, sum);
            if (sum < 0) sum = 0;
        }
        return best;
    }
}`,
          cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int sum = 0, best = INT_MIN;
        for (int x : nums) {
            sum += x;
            best = max(best, sum);
            if (sum < 0) sum = 0;
        }
        return best;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "A single pass with two variables.",
      },
    ],
    doubts: [
      {
        q: "Why update best before resetting the sum?",
        a: "If every number is negative, the sum becomes negative immediately. Updating first records each single element, so the answer is the largest (least negative) element instead of 0.",
      },
      {
        q: "How do I return the subarray itself?",
        a: "Remember the index where the current run started (set it when you reset). When best improves, store that start and the current index as the answer's bounds.",
      },
    ],
    followUps: [
      "Return the start and end indexes of the best subarray.",
      "Maximum Product Subarray (LeetCode 152): track both the maximum and minimum product.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "best-time-to-buy-and-sell-stock",
    leetcode: 121,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topicId: "arrays",
    group: "Prefix Sums & Kadane",
    pattern: "Track the minimum so far",
    statement: [
      "You are given an array `prices` where `prices[i]` is the price of a stock on day `i`.",
      "Choose one day to buy and a **later** day to sell to maximise profit. Return the maximum profit, or `0` if no profit is possible.",
    ],
    examples: [
      {
        input: args([7, 1, 5, 3, 6, 4]),
        output: "5",
        explanation: "Buy on day 1 (price 1) and sell on day 4 (price 6): profit 5.",
      },
      {
        input: args([7, 6, 4, 3, 1]),
        output: "0",
        explanation: "Prices only fall, so do not trade.",
      },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    functionName: "maxProfit",
    signature: { params: [{ name: "prices", type: "number[]" }], returnType: "number" },
    testCases: [
      { input: args([7, 1, 5, 3, 6, 4]), expectedOutput: out(5) },
      { input: args([7, 6, 4, 3, 1]), expectedOutput: out(0) },
      { input: args([1]), expectedOutput: out(0), isHidden: true },
      { input: args([2, 4, 1]), expectedOutput: out(2), isHidden: true },
      { input: args([3, 3, 5, 0, 0, 3, 1, 4]), expectedOutput: out(4), isHidden: true },
      { input: args([1, 2]), expectedOutput: out(1), isHidden: true },
    ],
    hints: [
      "For each day, what is the best price you could have bought at before it?",
      "Keep the minimum price seen so far as you scan.",
    ],
    check: {
      prompt: "prices = [4, 9, 1, 6]. What is returned?",
      options: ["5", "8", "3", "0"],
      correctIndex: 0,
      explanation:
        "Buy at 4 and sell at 9 for 5. Buying at 1 and selling at 6 also gives 5. Selling at 9 after buying at 1 is not allowed, because 1 comes later.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Try every buy day with every later sell day.",
        intuition: [
          "Check all pairs (i, j) with i < j and keep the largest prices[j] − prices[i].",
        ],
        steps: [
          "For each `i` and each `j > i`, update `best = max(best, prices[j] − prices[i])`.",
          "Return `best` (at least 0).",
        ],
        code: {
          javascript: `var maxProfit = function(prices) {
    let best = 0;
    for (let i = 0; i < prices.length; i++) {
        for (let j = i + 1; j < prices.length; j++) {
            best = Math.max(best, prices[j] - prices[i]);
        }
    }
    return best;
};`,
          python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        best = 0
        for i in range(len(prices)):
            for j in range(i + 1, len(prices)):
                best = max(best, prices[j] - prices[i])
        return best`,
          java: `class Solution {
    public int maxProfit(int[] prices) {
        int best = 0;
        for (int i = 0; i < prices.length; i++) {
            for (int j = i + 1; j < prices.length; j++) {
                best = Math.max(best, prices[j] - prices[i]);
            }
        }
        return best;
    }
}`,
          cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int best = 0;
        for (size_t i = 0; i < prices.size(); i++) {
            for (size_t j = i + 1; j < prices.size(); j++) {
                best = max(best, prices[j] - prices[i]);
            }
        }
        return best;
    }
};`,
        },
        time: "O(n²)",
        space: "O(1)",
        complexityNote: "n(n−1)/2 pairs.",
      },
      {
        name: "Optimal",
        summary: "Track the cheapest price so far; selling today earns price − minSoFar.",
        intuition: [
          "If you sell on day j, the best buy day is the cheapest day before j. So scan once, remembering the minimum price seen so far, and compute today's possible profit against it.",
        ],
        steps: [
          "Set `minPrice = ∞`, `best = 0`.",
          "For each `price`: `minPrice = min(minPrice, price)`; `best = max(best, price − minPrice)`.",
          "Return `best`.",
        ],
        dryRun: {
          title: "prices = [7, 1, 5, 3, 6, 4]",
          columns: ["Day", "price", "minPrice", "Profit if sold today", "best"],
          rows: [
            ["0", "7", "7", "0", "0"],
            ["1", "1", "1", "0", "0"],
            ["2", "5", "1", "4", "4"],
            ["3", "3", "1", "2", "4"],
            ["4", "6", "1", "5", "5"],
            ["5", "4", "1", "3", "5"],
          ],
          result: "best = 5",
        },
        code: {
          javascript: `var maxProfit = function(prices) {
    let minPrice = Infinity, best = 0;
    for (const price of prices) {
        minPrice = Math.min(minPrice, price);
        best = Math.max(best, price - minPrice);
    }
    return best;
};`,
          python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price, best = float("inf"), 0
        for price in prices:
            min_price = min(min_price, price)
            best = max(best, price - min_price)
        return best`,
          java: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, best = 0;
        for (int price : prices) {
            minPrice = Math.min(minPrice, price);
            best = Math.max(best, price - minPrice);
        }
        return best;
    }
}`,
          cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX, best = 0;
        for (int price : prices) {
            minPrice = min(minPrice, price);
            best = max(best, price - minPrice);
        }
        return best;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "One pass with two variables.",
      },
    ],
    doubts: [
      {
        q: "Why not just return max(prices) − min(prices)?",
        a: "The minimum might come after the maximum. In [7, 6, 4, 3, 1] that formula gives 6, but you cannot sell before you buy, so the answer is 0.",
      },
      {
        q: "How is this related to Kadane's algorithm?",
        a: "The profit between days i and j is the sum of daily price changes between them. Finding the best buy/sell pair is the maximum subarray sum of the daily differences.",
      },
    ],
    followUps: [
      "Best Time to Buy and Sell Stock II (LeetCode 122): unlimited transactions.",
      "With a cooldown day after selling (LeetCode 309): a dynamic programming problem.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "product-of-array-except-self",
    leetcode: 238,
    title: "Product of Array Except Self",
    difficulty: "Medium",
    topicId: "arrays",
    group: "Prefix Sums & Kadane",
    pattern: "Prefix and suffix products",
    statement: [
      "Given an integer array `nums`, return an array `answer` such that `answer[i]` is the product of all elements of `nums` except `nums[i]`.",
      "Solve it in O(n) time **without using division**.",
    ],
    examples: [
      { input: args([1, 2, 3, 4]), output: "[24,12,8,6]" },
      { input: args([-1, 1, 0, -3, 3]), output: "[0,0,9,0,0]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "Every product fits in a 32-bit integer.",
    ],
    functionName: "productExceptSelf",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number[]" },
    testCases: [
      { input: args([1, 2, 3, 4]), expectedOutput: out([24, 12, 8, 6]) },
      { input: args([-1, 1, 0, -3, 3]), expectedOutput: out([0, 0, 9, 0, 0]) },
      { input: args([2, 3]), expectedOutput: out([3, 2]), isHidden: true },
      { input: args([0, 0]), expectedOutput: out([0, 0]), isHidden: true },
      { input: args([5, 1, 1]), expectedOutput: out([1, 5, 5]), isHidden: true },
      { input: args([1, -1]), expectedOutput: out([-1, 1]), isHidden: true },
    ],
    hints: [
      "answer[i] = (product of everything to the left of i) × (product of everything to the right of i).",
      "Fill the left products in one pass and multiply in the right products in a second pass from the end.",
    ],
    check: {
      prompt: "nums = [2, 3, 4]. What is returned?",
      options: ["[12,8,6]", "[24,24,24]", "[7,6,5]", "[6,8,12]"],
      correctIndex: 0,
      explanation: "3×4 = 12, 2×4 = 8, 2×3 = 6.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "For each index, multiply all the other elements.",
        intuition: [
          "Directly follow the definition: for each i, loop over every j ≠ i and multiply.",
        ],
        steps: [
          "For each `i`, set `p = 1`; multiply `p` by every `nums[j]` with `j != i`; store `p`.",
        ],
        code: {
          javascript: `var productExceptSelf = function(nums) {
    const n = nums.length;
    const answer = new Array(n);
    for (let i = 0; i < n; i++) {
        let p = 1;
        for (let j = 0; j < n; j++) if (j !== i) p *= nums[j];
        answer[i] = p;
    }
    return answer;
};`,
          python: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = []
        for i in range(n):
            p = 1
            for j in range(n):
                if j != i:
                    p *= nums[j]
            answer.append(p)
        return answer`,
          java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        for (int i = 0; i < n; i++) {
            int p = 1;
            for (int j = 0; j < n; j++) if (j != i) p *= nums[j];
            answer[i] = p;
        }
        return answer;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n);
        for (int i = 0; i < n; i++) {
            int p = 1;
            for (int j = 0; j < n; j++) if (j != i) p *= nums[j];
            answer[i] = p;
        }
        return answer;
    }
};`,
        },
        time: "O(n²)",
        space: "O(1)",
        complexityNote: "n products of n − 1 terms each (the output array is not counted).",
      },
      {
        name: "Optimal",
        summary: "answer[i] = left product × right product, built in two passes.",
        intuition: [
          "Everything except nums[i] is 'everything to its left' times 'everything to its right'. Store left products in the answer array during a forward pass, then sweep backwards keeping a running right product and multiply it in. No division, so zeros are handled naturally.",
        ],
        steps: [
          "Forward pass: `answer[i] = product of nums[0..i-1]` (with `answer[0] = 1`).",
          "Backward pass: keep `right = 1`; for i from n − 1 down to 0: `answer[i] *= right`, then `right *= nums[i]`.",
          "Return `answer`.",
        ],
        dryRun: {
          title: "nums = [1, 2, 3, 4]",
          columns: [
            "i",
            "Left product (pass 1)",
            "right before (pass 2)",
            "answer[i] = left × right",
          ],
          rows: [
            ["3", "1·2·3 = 6", "1", "6"],
            ["2", "1·2 = 2", "4", "8"],
            ["1", "1", "4·3 = 12", "12"],
            ["0", "1 (nothing on the left)", "12·2 = 24", "24"],
          ],
          result: "[24,12,8,6]",
        },
        code: {
          javascript: `var productExceptSelf = function(nums) {
    const n = nums.length;
    const answer = new Array(n).fill(1);
    for (let i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];
    let right = 1;
    for (let i = n - 1; i >= 0; i--) {
        answer[i] *= right;
        right *= nums[i];
    }
    return answer;
};`,
          python: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = [1] * n
        for i in range(1, n):
            answer[i] = answer[i - 1] * nums[i - 1]
        right = 1
        for i in range(n - 1, -1, -1):
            answer[i] *= right
            right *= nums[i]
        return answer`,
          java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        answer[0] = 1;
        for (int i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= right;
            right *= nums[i];
        }
        return answer;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n, 1);
        for (int i = 1; i < n; i++) answer[i] = answer[i - 1] * nums[i - 1];
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= right;
            right *= nums[i];
        }
        return answer;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "Two passes. Apart from the output array, only one extra variable is used.",
      },
    ],
    doubts: [
      {
        q: "Why not divide the total product by nums[i]?",
        a: "The problem forbids division, and it breaks with zeros: if nums contains a 0, the total product is 0 and you cannot divide by the zero element. The prefix/suffix method needs no special cases.",
      },
      {
        q: "Why is the space O(1) if we create an answer array?",
        a: "By convention the output array is not counted as extra space. Apart from it, we only use the variable right.",
      },
    ],
    followUps: [
      "Solve it with division while correctly handling zero, one and two-or-more zeros.",
      "Compute prefix products modulo 10^9 + 7 for very large values.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "rearrange-array-elements-by-sign",
    leetcode: 2149,
    title: "Rearrange Array Elements by Sign",
    difficulty: "Medium",
    topicId: "arrays",
    group: "In-place & Two Pointers",
    pattern: "Two write indexes (even / odd)",
    statement: [
      "You are given an array `nums` of even length with an equal number of positive and negative integers.",
      "Rearrange it so that every consecutive pair has opposite signs, the array **starts with a positive** number, and the relative order of the positives and of the negatives is preserved. Return the rearranged array.",
    ],
    examples: [
      {
        input: args([3, 1, -2, -5, 2, -4]),
        output: "[3,-2,1,-5,2,-4]",
        explanation:
          "Positives in order: 3, 1, 2. Negatives in order: -2, -5, -4. Interleave them, starting with a positive.",
      },
      { input: args([-1, 1]), output: "[1,-1]" },
    ],
    constraints: [
      "2 <= nums.length <= 2 * 10^5",
      "nums.length is even",
      "1 <= |nums[i]| <= 10^5",
      "Equal numbers of positive and negative integers.",
    ],
    functionName: "rearrangeArray",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number[]" },
    testCases: [
      { input: args([3, 1, -2, -5, 2, -4]), expectedOutput: out([3, -2, 1, -5, 2, -4]) },
      { input: args([-1, 1]), expectedOutput: out([1, -1]) },
      { input: args([1, -1, 2, -2]), expectedOutput: out([1, -1, 2, -2]), isHidden: true },
      { input: args([-3, -2, 4, 5]), expectedOutput: out([4, -3, 5, -2]), isHidden: true },
      {
        input: args([2, 3, -1, -4, 5, -6]),
        expectedOutput: out([2, -1, 3, -4, 5, -6]),
        isHidden: true,
      },
    ],
    hints: [
      "Positives go to even indexes 0, 2, 4, …; negatives to odd indexes 1, 3, 5, ….",
      "Keep one write index for positives and one for negatives.",
    ],
    check: {
      prompt: "nums = [-4, 7, -1, 2]. What is returned?",
      options: ["[7,-4,2,-1]", "[7,-1,2,-4]", "[-4,7,-1,2]", "[2,-4,7,-1]"],
      correctIndex: 0,
      explanation:
        "Positives in order: 7, 2. Negatives in order: -4, -1. Interleave: 7, -4, 2, -1.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Split into a positives list and a negatives list, then interleave.",
        intuition: [
          "Collecting each sign separately keeps their order. Then place pos[i] at index 2i and neg[i] at index 2i + 1.",
        ],
        steps: [
          "Collect positives into `pos` and negatives into `neg`, in order.",
          "For each i: `nums[2i] = pos[i]`, `nums[2i + 1] = neg[i]`.",
        ],
        code: {
          javascript: `var rearrangeArray = function(nums) {
    const pos = nums.filter((x) => x > 0);
    const neg = nums.filter((x) => x < 0);
    for (let i = 0; i < pos.length; i++) {
        nums[2 * i] = pos[i];
        nums[2 * i + 1] = neg[i];
    }
    return nums;
};`,
          python: `class Solution:
    def rearrangeArray(self, nums: List[int]) -> List[int]:
        pos = [x for x in nums if x > 0]
        neg = [x for x in nums if x < 0]
        for i in range(len(pos)):
            nums[2 * i] = pos[i]
            nums[2 * i + 1] = neg[i]
        return nums`,
          java: `class Solution {
    public int[] rearrangeArray(int[] nums) {
        List<Integer> pos = new ArrayList<>(), neg = new ArrayList<>();
        for (int x : nums) {
            if (x > 0) pos.add(x);
            else neg.add(x);
        }
        for (int i = 0; i < pos.size(); i++) {
            nums[2 * i] = pos.get(i);
            nums[2 * i + 1] = neg.get(i);
        }
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> rearrangeArray(vector<int>& nums) {
        vector<int> pos, neg;
        for (int x : nums) (x > 0 ? pos : neg).push_back(x);
        for (size_t i = 0; i < pos.size(); i++) {
            nums[2 * i] = pos[i];
            nums[2 * i + 1] = neg[i];
        }
        return nums;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote: "Two passes (split, then merge) and two lists holding n elements in total.",
      },
      {
        name: "Optimal",
        summary:
          "One pass: write each positive to the next even index and each negative to the next odd index.",
        intuition: [
          "We already know where every element belongs: the k-th positive goes to index 2k and the k-th negative to index 2k + 1. Two write pointers, starting at 0 and 1 and each jumping by 2, place everything in a single scan.",
        ],
        steps: [
          "Create `res` of length n; set `posIdx = 0`, `negIdx = 1`.",
          "For each `x`: if positive, `res[posIdx] = x`, `posIdx += 2`; else `res[negIdx] = x`, `negIdx += 2`.",
          "Return `res`.",
        ],
        dryRun: {
          title: "nums = [3, 1, -2, -5, 2, -4]",
          columns: ["x", "Sign", "Written to", "posIdx / negIdx after", "res"],
          rows: [
            ["3", "+", "0", "2 / 1", "[3,_,_,_,_,_]"],
            ["1", "+", "2", "4 / 1", "[3,_,1,_,_,_]"],
            ["-2", "−", "1", "4 / 3", "[3,-2,1,_,_,_]"],
            ["-5", "−", "3", "4 / 5", "[3,-2,1,-5,_,_]"],
            ["2", "+", "4", "6 / 5", "[3,-2,1,-5,2,_]"],
            ["-4", "−", "5", "6 / 7", "[3,-2,1,-5,2,-4]"],
          ],
          result: "[3,-2,1,-5,2,-4]",
        },
        code: {
          javascript: `var rearrangeArray = function(nums) {
    const res = new Array(nums.length);
    let posIdx = 0, negIdx = 1;
    for (const x of nums) {
        if (x > 0) {
            res[posIdx] = x;
            posIdx += 2;
        } else {
            res[negIdx] = x;
            negIdx += 2;
        }
    }
    return res;
};`,
          python: `class Solution:
    def rearrangeArray(self, nums: List[int]) -> List[int]:
        res = [0] * len(nums)
        pos_idx, neg_idx = 0, 1
        for x in nums:
            if x > 0:
                res[pos_idx] = x
                pos_idx += 2
            else:
                res[neg_idx] = x
                neg_idx += 2
        return res`,
          java: `class Solution {
    public int[] rearrangeArray(int[] nums) {
        int[] res = new int[nums.length];
        int posIdx = 0, negIdx = 1;
        for (int x : nums) {
            if (x > 0) {
                res[posIdx] = x;
                posIdx += 2;
            } else {
                res[negIdx] = x;
                negIdx += 2;
            }
        }
        return res;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> rearrangeArray(vector<int>& nums) {
        vector<int> res(nums.size());
        int posIdx = 0, negIdx = 1;
        for (int x : nums) {
            if (x > 0) {
                res[posIdx] = x;
                posIdx += 2;
            } else {
                res[negIdx] = x;
                negIdx += 2;
            }
        }
        return res;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote:
          "A single pass. The result array is the output; no other extra structures are needed.",
      },
    ],
    doubts: [
      {
        q: "Can this be done in place with O(1) extra space?",
        a: "Not while preserving the order of each sign in O(n) time. In-place versions either break the order or need O(n²) shifting. That is why the standard solution writes into a new array.",
      },
      {
        q: "What if positives and negatives are not equal in number?",
        a: "Interleave while both have elements left, then append the leftovers in order (Striver's 'variety 2' of this problem).",
      },
    ],
    followUps: [
      "Handle unequal counts by appending the leftovers at the end.",
      "Next Permutation (LeetCode 31), another in-place array rearrangement.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "trapping-rain-water",
    leetcode: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topicId: "arrays",
    group: "In-place & Two Pointers",
    pattern: "Two pointers with running maxima",
    statement: [
      "Given `n` non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.",
      "The water above a bar is limited by the shorter of the tallest bar on its left and the tallest bar on its right.",
    ],
    examples: [
      {
        input: args([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]),
        output: "6",
        explanation: "6 units of water are trapped between the bars.",
      },
      { input: args([4, 2, 0, 3, 2, 5]), output: "9" },
    ],
    constraints: ["1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    functionName: "trap",
    signature: { params: [{ name: "height", type: "number[]" }], returnType: "number" },
    testCases: [
      { input: args([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), expectedOutput: out(6) },
      { input: args([4, 2, 0, 3, 2, 5]), expectedOutput: out(9) },
      { input: args([1]), expectedOutput: out(0), isHidden: true },
      { input: args([3, 0, 3]), expectedOutput: out(3), isHidden: true },
      { input: args([5, 4, 3, 2, 1]), expectedOutput: out(0), isHidden: true },
      { input: args([2, 0, 2, 0, 2]), expectedOutput: out(4), isHidden: true },
    ],
    hints: [
      "Water at index i = min(tallest bar to the left, tallest bar to the right) − height[i].",
      "Precompute the left maxima and right maxima arrays.",
      "With two pointers you only need the smaller side's maximum. Why is that enough?",
    ],
    check: {
      prompt: "height = [3, 1, 2]. How much water is trapped?",
      options: ["0", "1", "2", "3"],
      correctIndex: 1,
      explanation: "Above index 1: min(3, 2) − 1 = 1. The ends cannot hold water.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "For each bar, scan left and right for the tallest bars.",
        intuition: [
          "Follow the formula literally: for every index, find the tallest bar on each side and add min(left, right) − height.",
        ],
        steps: [
          "For each `i`, compute `leftMax` = max of `height[0..i]` and `rightMax` = max of `height[i..n-1]`.",
          "Add `min(leftMax, rightMax) − height[i]`.",
        ],
        code: {
          javascript: `var trap = function(height) {
    let water = 0;
    for (let i = 0; i < height.length; i++) {
        let leftMax = 0, rightMax = 0;
        for (let j = 0; j <= i; j++) leftMax = Math.max(leftMax, height[j]);
        for (let j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);
        water += Math.min(leftMax, rightMax) - height[i];
    }
    return water;
};`,
          python: `class Solution:
    def trap(self, height: List[int]) -> int:
        water = 0
        for i in range(len(height)):
            left_max = max(height[: i + 1])
            right_max = max(height[i:])
            water += min(left_max, right_max) - height[i]
        return water`,
          java: `class Solution {
    public int trap(int[] height) {
        int water = 0;
        for (int i = 0; i < height.length; i++) {
            int leftMax = 0, rightMax = 0;
            for (int j = 0; j <= i; j++) leftMax = Math.max(leftMax, height[j]);
            for (int j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);
            water += Math.min(leftMax, rightMax) - height[i];
        }
        return water;
    }
}`,
          cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        int water = 0, n = height.size();
        for (int i = 0; i < n; i++) {
            int leftMax = 0, rightMax = 0;
            for (int j = 0; j <= i; j++) leftMax = max(leftMax, height[j]);
            for (int j = i; j < n; j++) rightMax = max(rightMax, height[j]);
            water += min(leftMax, rightMax) - height[i];
        }
        return water;
    }
};`,
        },
        time: "O(n²)",
        space: "O(1)",
        complexityNote: "Each of the n bars scans the whole array.",
      },
      {
        name: "Better",
        summary: "Precompute prefix maxima and suffix maxima.",
        intuition: [
          "The tallest bar to the left of i is just the running maximum from the left, and likewise from the right. Compute both arrays once and reuse them.",
        ],
        steps: [
          "`leftMax[i] = max(leftMax[i-1], height[i])`.",
          "`rightMax[i] = max(rightMax[i+1], height[i])`.",
          "Sum `min(leftMax[i], rightMax[i]) − height[i]`.",
        ],
        code: {
          javascript: `var trap = function(height) {
    const n = height.length;
    const leftMax = new Array(n), rightMax = new Array(n);
    leftMax[0] = height[0];
    for (let i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);
    rightMax[n - 1] = height[n - 1];
    for (let i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);
    let water = 0;
    for (let i = 0; i < n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];
    return water;
};`,
          python: `class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        left_max, right_max = [0] * n, [0] * n
        left_max[0] = height[0]
        for i in range(1, n):
            left_max[i] = max(left_max[i - 1], height[i])
        right_max[-1] = height[-1]
        for i in range(n - 2, -1, -1):
            right_max[i] = max(right_max[i + 1], height[i])
        return sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))`,
          java: `class Solution {
    public int trap(int[] height) {
        int n = height.length;
        int[] leftMax = new int[n], rightMax = new int[n];
        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);
        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);
        int water = 0;
        for (int i = 0; i < n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];
        return water;
    }
}`,
          cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        vector<int> leftMax(n), rightMax(n);
        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) leftMax[i] = max(leftMax[i - 1], height[i]);
        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) rightMax[i] = max(rightMax[i + 1], height[i]);
        int water = 0;
        for (int i = 0; i < n; i++) water += min(leftMax[i], rightMax[i]) - height[i];
        return water;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote: "Three linear passes and two extra arrays.",
      },
      {
        name: "Optimal",
        summary:
          "Two pointers: always move the side with the smaller bar; its running maximum decides the water.",
        intuition: [
          "Put pointers at both ends. If `height[l] <= height[r]`, the water above l depends only on `leftMax`: a bar at least as tall as height[l] (namely height[r]) is guaranteed on the right, so the right side will never be the limit.",
          "So process the smaller side, update its running maximum, add `max − height`, and move inward. No extra arrays are needed.",
        ],
        steps: [
          "Set `l = 0`, `r = n − 1`, `leftMax = rightMax = 0`, `water = 0`.",
          "While `l < r`: if `height[l] <= height[r]`, update `leftMax`, add `leftMax − height[l]`, `l++`.",
          "Otherwise update `rightMax`, add `rightMax − height[r]`, `r--`.",
          "Return `water`.",
        ],
        dryRun: {
          title: "height = [4, 2, 0, 3, 2, 5]",
          columns: ["l", "r", "Smaller side", "Max on that side", "Water added", "Total"],
          rows: [
            ["0", "5", "left (4 ≤ 5)", "leftMax = 4", "4 − 4 = 0", "0"],
            ["1", "5", "left (2 ≤ 5)", "leftMax = 4", "4 − 2 = 2", "2"],
            ["2", "5", "left (0 ≤ 5)", "leftMax = 4", "4 − 0 = 4", "6"],
            ["3", "5", "left (3 ≤ 5)", "leftMax = 4", "4 − 3 = 1", "7"],
            ["4", "5", "left (2 ≤ 5)", "leftMax = 4", "4 − 2 = 2", "9"],
          ],
          result: "l meets r → water = 9",
        },
        code: {
          javascript: `var trap = function(height) {
    let l = 0, r = height.length - 1;
    let leftMax = 0, rightMax = 0, water = 0;
    while (l < r) {
        if (height[l] <= height[r]) {
            leftMax = Math.max(leftMax, height[l]);
            water += leftMax - height[l];
            l++;
        } else {
            rightMax = Math.max(rightMax, height[r]);
            water += rightMax - height[r];
            r--;
        }
    }
    return water;
};`,
          python: `class Solution:
    def trap(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        left_max = right_max = water = 0
        while l < r:
            if height[l] <= height[r]:
                left_max = max(left_max, height[l])
                water += left_max - height[l]
                l += 1
            else:
                right_max = max(right_max, height[r])
                water += right_max - height[r]
                r -= 1
        return water`,
          java: `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] <= height[r]) {
                leftMax = Math.max(leftMax, height[l]);
                water += leftMax - height[l];
                l++;
            } else {
                rightMax = Math.max(rightMax, height[r]);
                water += rightMax - height[r];
                r--;
            }
        }
        return water;
    }
}`,
          cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] <= height[r]) {
                leftMax = max(leftMax, height[l]);
                water += leftMax - height[l];
                l++;
            } else {
                rightMax = max(rightMax, height[r]);
                water += rightMax - height[r];
                r--;
            }
        }
        return water;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote:
          "Each step moves one pointer inward, so n steps in total, with four variables.",
      },
    ],
    doubts: [
      {
        q: "Why can we ignore the right side's maximum when height[l] <= height[r]?",
        a: "The water above l is min(leftMax, trueRightMax) − height[l]. We know trueRightMax ≥ height[r] ≥ height[l], and leftMax only grows when it meets taller bars, so the minimum is decided by leftMax. The right side can only be taller, never the limit.",
      },
      {
        q: "Why is no water trapped at the first and last bars?",
        a: "There is no wall beyond the edges, so water there would simply flow off.",
      },
    ],
    followUps: [
      "Solve it with a monotonic stack, filling water layer by layer.",
      "Trapping Rain Water II (LeetCode 407): the 2D version using a min-heap.",
    ],
  },
];
