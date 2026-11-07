import { args, out } from "@/lib/tracks/types";
import type { DsaProblem } from "./types";

// Arrays, part 1: fundamentals, then in-place rearrangement with two pointers.

const RETURN_ARRAY_NOTE =
  "On LeetCode you modify `nums` in place. Here, do the same in-place work and then **return** the resulting array so it can be checked.";

export const arraysPart1: DsaProblem[] = [
  /* ------------------------------------------------------------------ */
  {
    id: "second-largest-element",
    title: "Second Largest Element",
    difficulty: "Easy",
    topicId: "arrays",
    group: "Fundamentals",
    pattern: "Single pass with two trackers",
    statement: [
      "Given an array of non-negative integers `nums`, return the **second largest distinct** element.",
      "If there is no second largest element (all values are equal, or the array has one element), return `-1`.",
    ],
    examples: [
      {
        input: args([1, 2, 4, 7, 7, 5]),
        output: "5",
        explanation: "The largest value is 7. The largest value smaller than 7 is 5.",
      },
      {
        input: args([10, 10, 10]),
        output: "-1",
        explanation: "Every element is 10, so there is no second largest.",
      },
    ],
    constraints: ["1 <= nums.length <= 10^5", "0 <= nums[i] <= 10^9"],
    functionName: "secondLargest",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number" },
    testCases: [
      { input: args([1, 2, 4, 7, 7, 5]), expectedOutput: out(5) },
      { input: args([10, 10, 10]), expectedOutput: out(-1) },
      { input: args([7]), expectedOutput: out(-1), isHidden: true },
      { input: args([3, 9]), expectedOutput: out(3), isHidden: true },
      { input: args([5, 1, 5, 3, 4]), expectedOutput: out(4), isHidden: true },
      { input: args([0, 0, 1]), expectedOutput: out(0), isHidden: true },
    ],
    hints: [
      "Sorting works, but watch out for duplicates of the largest value.",
      "Can you do it without sorting? Find the largest first, then the largest value that is smaller than it.",
      "In one pass, keep two variables: `largest` and `second`. What should happen to `second` when a new largest appears?",
    ],
    check: {
      prompt: "nums = [4, 4, 2, 9, 9]. What should the function return?",
      options: ["9", "4", "2", "-1"],
      correctIndex: 1,
      explanation: "The largest is 9 (twice). The second largest distinct value is 4.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Sort, then walk back from the end until the value changes.",
        intuition: [
          "After sorting, the largest value sits at the end. The second largest is the first value we meet, walking left, that is **different** from it. Simply taking `nums[n - 2]` is wrong when the largest value repeats.",
        ],
        steps: [
          "Sort a copy of the array in ascending order.",
          "Let `largest` be the last element.",
          "Scan from index `n - 2` down to `0`; return the first element not equal to `largest`.",
          "If no such element exists, return `-1`.",
        ],
        code: {
          javascript: `var secondLargest = function(nums) {
    const sorted = [...nums].sort((a, b) => a - b);
    const largest = sorted[sorted.length - 1];
    for (let i = sorted.length - 2; i >= 0; i--) {
        if (sorted[i] !== largest) return sorted[i];
    }
    return -1;
};`,
          python: `class Solution:
    def secondLargest(self, nums: List[int]) -> int:
        ordered = sorted(nums)
        largest = ordered[-1]
        for i in range(len(ordered) - 2, -1, -1):
            if ordered[i] != largest:
                return ordered[i]
        return -1`,
          java: `class Solution {
    public int secondLargest(int[] nums) {
        int[] sorted = nums.clone();
        Arrays.sort(sorted);
        int largest = sorted[sorted.length - 1];
        for (int i = sorted.length - 2; i >= 0; i--) {
            if (sorted[i] != largest) return sorted[i];
        }
        return -1;
    }
}`,
          cpp: `class Solution {
public:
    int secondLargest(vector<int>& nums) {
        vector<int> sorted = nums;
        sort(sorted.begin(), sorted.end());
        int largest = sorted.back();
        for (int i = (int)sorted.size() - 2; i >= 0; i--) {
            if (sorted[i] != largest) return sorted[i];
        }
        return -1;
    }
};`,
        },
        time: "O(n log n)",
        space: "O(n)",
        complexityNote:
          "Sorting dominates. We sort a copy so the input is untouched, which costs O(n) space.",
      },
      {
        name: "Better",
        summary: "Two passes: find the largest, then the largest value below it.",
        intuition: [
          "We don't need the whole array in order, only the top two distinct values. One pass finds the maximum; a second pass finds the biggest value that is strictly smaller than that maximum.",
        ],
        steps: [
          "Pass 1: `largest` = maximum of the array.",
          "Pass 2: `second` = maximum of all elements strictly less than `largest`, starting from `-1`.",
          "Return `second`.",
        ],
        code: {
          javascript: `var secondLargest = function(nums) {
    let largest = -1;
    for (const x of nums) largest = Math.max(largest, x);
    let second = -1;
    for (const x of nums) {
        if (x !== largest && x > second) second = x;
    }
    return second;
};`,
          python: `class Solution:
    def secondLargest(self, nums: List[int]) -> int:
        largest = max(nums)
        second = -1
        for x in nums:
            if x != largest and x > second:
                second = x
        return second`,
          java: `class Solution {
    public int secondLargest(int[] nums) {
        int largest = -1;
        for (int x : nums) largest = Math.max(largest, x);
        int second = -1;
        for (int x : nums) {
            if (x != largest && x > second) second = x;
        }
        return second;
    }
}`,
          cpp: `class Solution {
public:
    int secondLargest(vector<int>& nums) {
        int largest = -1;
        for (int x : nums) largest = max(largest, x);
        int second = -1;
        for (int x : nums) {
            if (x != largest && x > second) second = x;
        }
        return second;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "Two linear passes are still O(n), with only two variables of extra space.",
      },
      {
        name: "Optimal",
        summary: "One pass, updating `largest` and `second` together.",
        intuition: [
          "Track both answers as we go. When we see a new maximum, the old maximum becomes the second largest. When we see a value between `second` and `largest`, it becomes the new second largest. Equal values are ignored, which handles duplicates.",
        ],
        steps: [
          "Start with `largest = -1` and `second = -1`.",
          "For each `x`: if `x > largest`, set `second = largest` and `largest = x`.",
          "Else if `x < largest` and `x > second`, set `second = x`.",
          "Return `second`.",
        ],
        dryRun: {
          title: "nums = [1, 2, 4, 7, 7, 5]",
          columns: ["i", "x", "largest", "second", "What happened"],
          rows: [
            ["0", "1", "1", "-1", "new largest"],
            ["1", "2", "2", "1", "new largest, old one moves to second"],
            ["2", "4", "4", "2", "new largest"],
            ["3", "7", "7", "4", "new largest"],
            ["4", "7", "7", "4", "equal to largest: ignored"],
            ["5", "5", "7", "5", "between second and largest"],
          ],
          result: "second = 5",
        },
        code: {
          javascript: `var secondLargest = function(nums) {
    let largest = -1, second = -1;
    for (const x of nums) {
        if (x > largest) {
            second = largest;
            largest = x;
        } else if (x < largest && x > second) {
            second = x;
        }
    }
    return second;
};`,
          python: `class Solution:
    def secondLargest(self, nums: List[int]) -> int:
        largest = second = -1
        for x in nums:
            if x > largest:
                second, largest = largest, x
            elif second < x < largest:
                second = x
        return second`,
          java: `class Solution {
    public int secondLargest(int[] nums) {
        int largest = -1, second = -1;
        for (int x : nums) {
            if (x > largest) {
                second = largest;
                largest = x;
            } else if (x < largest && x > second) {
                second = x;
            }
        }
        return second;
    }
}`,
          cpp: `class Solution {
public:
    int secondLargest(vector<int>& nums) {
        int largest = -1, second = -1;
        for (int x : nums) {
            if (x > largest) {
                second = largest;
                largest = x;
            } else if (x < largest && x > second) {
                second = x;
            }
        }
        return second;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote:
          "A single pass with constant extra space; this is the best possible, since every element must be read.",
      },
    ],
    doubts: [
      {
        q: "Why not sort and return nums[n - 2]?",
        a: "If the largest value appears more than once, nums[n - 2] is the largest again, not the second largest. You must skip duplicates.",
      },
      {
        q: "Why start with -1?",
        a: "The constraints say values are non-negative, so -1 can never be a real answer and doubles as the 'not found' result. With negative values you would start from -Infinity (or Long.MIN_VALUE) and track 'not found' separately.",
      },
    ],
    followUps: [
      "Find the second smallest element in the same single pass.",
      "Generalise to the k-th largest distinct element. Which data structure keeps this efficient for large k?",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "check-if-array-is-sorted-and-rotated",
    leetcode: 1752,
    title: "Check if Array Is Sorted and Rotated",
    difficulty: "Easy",
    topicId: "arrays",
    group: "Fundamentals",
    pattern: "Count the 'drops' around a circle",
    statement: [
      "Given an array `nums`, return `true` if it was originally sorted in non-decreasing order and then rotated some number of positions (including zero). Otherwise, return `false`.",
      "The array may contain duplicates.",
    ],
    examples: [
      {
        input: args([3, 4, 5, 1, 2]),
        output: "true",
        explanation: "[1,2,3,4,5] rotated by 3 positions gives [3,4,5,1,2].",
      },
      {
        input: args([2, 1, 3, 4]),
        output: "false",
        explanation: "No rotation of a sorted array produces this order.",
      },
      {
        input: args([1, 2, 3]),
        output: "true",
        explanation: "A sorted array rotated by 0 positions.",
      },
    ],
    constraints: ["1 <= nums.length <= 100", "1 <= nums[i] <= 100"],
    functionName: "check",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "boolean" },
    testCases: [
      { input: args([3, 4, 5, 1, 2]), expectedOutput: out(true) },
      { input: args([2, 1, 3, 4]), expectedOutput: out(false) },
      { input: args([1, 2, 3]), expectedOutput: out(true), isHidden: true },
      { input: args([1, 1, 1]), expectedOutput: out(true), isHidden: true },
      { input: args([2, 1]), expectedOutput: out(true), isHidden: true },
      { input: args([6, 10, 6]), expectedOutput: out(true), isHidden: true },
      { input: args([1, 3, 2]), expectedOutput: out(false), isHidden: true },
      { input: args([5]), expectedOutput: out(true), isHidden: true },
    ],
    hints: [
      "Think of the array as a circle: the last element is followed by the first.",
      "In a sorted-then-rotated array, how many times can a value be greater than the value after it?",
    ],
    check: {
      prompt: "nums = [2, 2, 3, 1, 2]. Return true or false?",
      options: ["true", "false"],
      correctIndex: 0,
      explanation:
        "It is [1,2,2,2,3] rotated. Going around the circle there is exactly one drop (3 → 1).",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Try every rotation and test whether it is sorted.",
        intuition: [
          "If the array is a rotation of a sorted array, then starting the scan at the right index gives a sorted sequence. We can simply try every starting index.",
        ],
        steps: [
          "For each start `r` from `0` to `n - 1`, read the array circularly from `r`.",
          "If the `n` elements read this way are non-decreasing, return `true`.",
          "If no start works, return `false`.",
        ],
        code: {
          javascript: `var check = function(nums) {
    const n = nums.length;
    for (let r = 0; r < n; r++) {
        let sorted = true;
        for (let i = 0; i + 1 < n; i++) {
            if (nums[(r + i) % n] > nums[(r + i + 1) % n]) {
                sorted = false;
                break;
            }
        }
        if (sorted) return true;
    }
    return false;
};`,
          python: `class Solution:
    def check(self, nums: List[int]) -> bool:
        n = len(nums)
        for r in range(n):
            if all(nums[(r + i) % n] <= nums[(r + i + 1) % n] for i in range(n - 1)):
                return True
        return False`,
          java: `class Solution {
    public boolean check(int[] nums) {
        int n = nums.length;
        for (int r = 0; r < n; r++) {
            boolean sorted = true;
            for (int i = 0; i + 1 < n; i++) {
                if (nums[(r + i) % n] > nums[(r + i + 1) % n]) {
                    sorted = false;
                    break;
                }
            }
            if (sorted) return true;
        }
        return false;
    }
}`,
          cpp: `class Solution {
public:
    bool check(vector<int>& nums) {
        int n = nums.size();
        for (int r = 0; r < n; r++) {
            bool sorted = true;
            for (int i = 0; i + 1 < n; i++) {
                if (nums[(r + i) % n] > nums[(r + i + 1) % n]) {
                    sorted = false;
                    break;
                }
            }
            if (sorted) return true;
        }
        return false;
    }
};`,
        },
        time: "O(n²)",
        space: "O(1)",
        complexityNote: "n possible starting points, each checked in O(n).",
      },
      {
        name: "Optimal",
        summary:
          "Count positions where a value is greater than the next one (circularly). At most one is allowed.",
        intuition: [
          "Walk around the circle comparing each element with the next. A sorted array has no 'drop' except possibly where the rotation happened (the end wrapping back to the start). A rotated sorted array has exactly one drop. Two or more drops means the order is broken somewhere else.",
        ],
        steps: [
          "Set `drops = 0`.",
          "For each `i`, if `nums[i] > nums[(i + 1) % n]`, increment `drops`.",
          "Return `drops <= 1`.",
        ],
        dryRun: {
          title: "nums = [3, 4, 5, 1, 2]",
          columns: ["i", "Compare", "Drop?", "drops"],
          rows: [
            ["0", "3 > 4", "no", "0"],
            ["1", "4 > 5", "no", "0"],
            ["2", "5 > 1", "yes", "1"],
            ["3", "1 > 2", "no", "1"],
            ["4", "2 > 3 (wraps to index 0)", "no", "1"],
          ],
          result: "drops = 1 ≤ 1 → true",
        },
        code: {
          javascript: `var check = function(nums) {
    const n = nums.length;
    let drops = 0;
    for (let i = 0; i < n; i++) {
        if (nums[i] > nums[(i + 1) % n]) drops++;
    }
    return drops <= 1;
};`,
          python: `class Solution:
    def check(self, nums: List[int]) -> bool:
        n = len(nums)
        drops = sum(1 for i in range(n) if nums[i] > nums[(i + 1) % n])
        return drops <= 1`,
          java: `class Solution {
    public boolean check(int[] nums) {
        int n = nums.length, drops = 0;
        for (int i = 0; i < n; i++) {
            if (nums[i] > nums[(i + 1) % n]) drops++;
        }
        return drops <= 1;
    }
}`,
          cpp: `class Solution {
public:
    bool check(vector<int>& nums) {
        int n = nums.size(), drops = 0;
        for (int i = 0; i < n; i++) {
            if (nums[i] > nums[(i + 1) % n]) drops++;
        }
        return drops <= 1;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "One pass with a counter.",
      },
    ],
    doubts: [
      {
        q: "Why compare the last element with the first?",
        a: "Rotation joins the end of the array to its start. For [2,1] the only drop is 2 → 1 inside the array, and the wrap 1 → 2 is fine. For [1,3,2] the drops are 3 → 2 and the wrap 2 → 1: two drops, so it is not a rotation.",
      },
      {
        q: "Do duplicates break the drop-counting idea?",
        a: "No. Equal neighbours are not drops because the order is non-decreasing. [1,1,1] has zero drops and is valid.",
      },
    ],
    followUps: [
      "Return by how many positions the array was rotated (the index just after the drop).",
      "Search for a target in a rotated sorted array in O(log n) (LeetCode 33).",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "max-consecutive-ones",
    leetcode: 485,
    title: "Max Consecutive Ones",
    difficulty: "Easy",
    topicId: "arrays",
    group: "Fundamentals",
    pattern: "Running count with reset",
    statement: [
      "Given a binary array `nums`, return the maximum number of consecutive `1`s in the array.",
    ],
    examples: [
      {
        input: args([1, 1, 0, 1, 1, 1]),
        output: "3",
        explanation: "The first two 1s form a run of 2; the last three form a run of 3.",
      },
      { input: args([1, 0, 1, 1, 0, 1]), output: "2" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "nums[i] is either 0 or 1."],
    functionName: "findMaxConsecutiveOnes",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number" },
    testCases: [
      { input: args([1, 1, 0, 1, 1, 1]), expectedOutput: out(3) },
      { input: args([1, 0, 1, 1, 0, 1]), expectedOutput: out(2) },
      { input: args([0, 0]), expectedOutput: out(0), isHidden: true },
      { input: args([1]), expectedOutput: out(1), isHidden: true },
      { input: args([1, 1, 1, 1]), expectedOutput: out(4), isHidden: true },
      { input: args([0, 1, 1, 0, 1, 1, 1, 1, 0]), expectedOutput: out(4), isHidden: true },
    ],
    hints: ["Keep a counter for the current run of 1s. What should happen to it when you see a 0?"],
    check: {
      prompt: "nums = [1, 0, 0, 1, 1, 0, 1]. What is returned?",
      options: ["1", "2", "3", "4"],
      correctIndex: 1,
      explanation: "The longest run is the two 1s at indices 3 and 4.",
    },
    approaches: [
      {
        name: "Optimal",
        summary: "Count the current run; reset on 0; remember the best run.",
        intuition: [
          "A run of 1s ends exactly when we see a 0. So keep a running count that grows on 1 and resets to 0 on 0, and record the largest value it ever reaches.",
        ],
        steps: [
          "Set `count = 0`, `best = 0`.",
          "For each element: if it is 1, increment `count` and update `best = max(best, count)`; otherwise set `count = 0`.",
          "Return `best`.",
        ],
        dryRun: {
          title: "nums = [1, 1, 0, 1, 1, 1]",
          columns: ["i", "nums[i]", "count", "best"],
          rows: [
            ["0", "1", "1", "1"],
            ["1", "1", "2", "2"],
            ["2", "0", "0", "2"],
            ["3", "1", "1", "2"],
            ["4", "1", "2", "2"],
            ["5", "1", "3", "3"],
          ],
          result: "best = 3",
        },
        code: {
          javascript: `var findMaxConsecutiveOnes = function(nums) {
    let count = 0, best = 0;
    for (const x of nums) {
        if (x === 1) {
            count++;
            best = Math.max(best, count);
        } else {
            count = 0;
        }
    }
    return best;
};`,
          python: `class Solution:
    def findMaxConsecutiveOnes(self, nums: List[int]) -> int:
        count = best = 0
        for x in nums:
            if x == 1:
                count += 1
                best = max(best, count)
            else:
                count = 0
        return best`,
          java: `class Solution {
    public int findMaxConsecutiveOnes(int[] nums) {
        int count = 0, best = 0;
        for (int x : nums) {
            if (x == 1) {
                count++;
                best = Math.max(best, count);
            } else {
                count = 0;
            }
        }
        return best;
    }
}`,
          cpp: `class Solution {
public:
    int findMaxConsecutiveOnes(vector<int>& nums) {
        int count = 0, best = 0;
        for (int x : nums) {
            if (x == 1) {
                count++;
                best = max(best, count);
            } else {
                count = 0;
            }
        }
        return best;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "Each element is visited once; two counters of extra space.",
      },
    ],
    doubts: [
      {
        q: "Why update best inside the loop instead of when a 0 appears?",
        a: "If the array ends with 1s, no 0 follows the last run. Updating on every 1 (or once more after the loop) makes sure that final run is counted.",
      },
    ],
    followUps: [
      "Max Consecutive Ones III (LeetCode 1004): you may flip at most k zeros. This becomes a sliding window problem.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "remove-duplicates-from-sorted-array",
    leetcode: 26,
    title: "Remove Duplicates from Sorted Array",
    difficulty: "Easy",
    topicId: "arrays",
    group: "In-place & Two Pointers",
    pattern: "Two pointers: slow writer, fast reader",
    statement: [
      "Given an integer array `nums` sorted in non-decreasing order, remove the duplicates **in place** so that each unique element appears only once, keeping their relative order.",
      "Return the array of unique elements, in order.",
    ],
    judgeNote:
      "On LeetCode you return `k`, the number of unique elements, after moving them to the front of `nums`. Here, return the first `k` elements (the unique values) so the result can be checked.",
    examples: [
      { input: args([1, 1, 2]), output: "[1,2]" },
      { input: args([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]), output: "[0,1,2,3,4]" },
    ],
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-100 <= nums[i] <= 100",
      "nums is sorted in non-decreasing order.",
    ],
    functionName: "removeDuplicates",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number[]" },
    testCases: [
      { input: args([1, 1, 2]), expectedOutput: out([1, 2]) },
      { input: args([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]), expectedOutput: out([0, 1, 2, 3, 4]) },
      { input: args([5]), expectedOutput: out([5]), isHidden: true },
      { input: args([1, 2, 3]), expectedOutput: out([1, 2, 3]), isHidden: true },
      { input: args([2, 2, 2, 2]), expectedOutput: out([2]), isHidden: true },
      { input: args([-3, -1, -1, 0, 0, 7]), expectedOutput: out([-3, -1, 0, 7]), isHidden: true },
    ],
    hints: [
      "The array is sorted, so duplicates sit next to each other.",
      "Use one pointer for the position to write the next unique value and another to read through the array.",
    ],
    check: {
      prompt: "nums = [1, 1, 1, 2, 3, 3]. What is returned?",
      options: ["[1,2,3]", "[1,1,2,3]", "[2]", "[1,2,3,3]"],
      correctIndex: 0,
      explanation: "Each distinct value is kept once, in order: 1, 2, 3.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Put every element into an ordered set, then copy the set back.",
        intuition: [
          "A set stores each value once. Because the input is sorted, iterating over the set in insertion (or sorted) order gives the unique values in the right order.",
        ],
        steps: [
          "Insert every element into a set that keeps order.",
          "Write the set's elements back to the front of `nums`; their count is `k`.",
          "Return the first `k` elements.",
        ],
        code: {
          javascript: `var removeDuplicates = function(nums) {
    const unique = [...new Set(nums)];
    for (let i = 0; i < unique.length; i++) nums[i] = unique[i];
    return nums.slice(0, unique.length);
};`,
          python: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> List[int]:
        unique = list(dict.fromkeys(nums))
        nums[:len(unique)] = unique
        return nums[:len(unique)]`,
          java: `class Solution {
    public int[] removeDuplicates(int[] nums) {
        Set<Integer> unique = new LinkedHashSet<>();
        for (int x : nums) unique.add(x);
        int k = 0;
        for (int x : unique) nums[k++] = x;
        return Arrays.copyOf(nums, k);
    }
}`,
          cpp: `class Solution {
public:
    vector<int> removeDuplicates(vector<int>& nums) {
        set<int> unique(nums.begin(), nums.end());
        int k = 0;
        for (int x : unique) nums[k++] = x;
        return vector<int>(nums.begin(), nums.begin() + k);
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote:
          "The set may hold every element (O(n) space). Hash sets are O(n) time; C++'s ordered std::set is O(n log n).",
      },
      {
        name: "Optimal",
        summary:
          "Slow pointer `i` marks the last unique value; fast pointer `j` scans for the next new value.",
        intuition: [
          "Because the array is sorted, a new unique value is simply one that differs from the last unique value we kept. Keep `nums[0..i]` as the unique prefix. Whenever `nums[j]` differs from `nums[i]`, extend the prefix by one and copy it there. No extra memory is needed.",
        ],
        steps: [
          "Set `i = 0` (the first element is always unique).",
          "For `j` from 1 to `n - 1`: if `nums[j] != nums[i]`, do `i++` and `nums[i] = nums[j]`.",
          "The unique values are `nums[0..i]`; return them.",
        ],
        dryRun: {
          title: "nums = [1, 1, 2, 3, 3]",
          columns: ["j", "nums[j]", "nums[i]", "Action", "i", "Unique prefix"],
          rows: [
            ["1", "1", "1", "same, skip", "0", "[1]"],
            ["2", "2", "1", "new: i++, write 2", "1", "[1,2]"],
            ["3", "3", "2", "new: i++, write 3", "2", "[1,2,3]"],
            ["4", "3", "3", "same, skip", "2", "[1,2,3]"],
          ],
          result: "k = i + 1 = 3 → [1,2,3]",
        },
        code: {
          javascript: `var removeDuplicates = function(nums) {
    let i = 0;
    for (let j = 1; j < nums.length; j++) {
        if (nums[j] !== nums[i]) {
            i++;
            nums[i] = nums[j];
        }
    }
    return nums.slice(0, i + 1);
};`,
          python: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> List[int]:
        i = 0
        for j in range(1, len(nums)):
            if nums[j] != nums[i]:
                i += 1
                nums[i] = nums[j]
        return nums[:i + 1]`,
          java: `class Solution {
    public int[] removeDuplicates(int[] nums) {
        int i = 0;
        for (int j = 1; j < nums.length; j++) {
            if (nums[j] != nums[i]) {
                i++;
                nums[i] = nums[j];
            }
        }
        return Arrays.copyOf(nums, i + 1);
    }
}`,
          cpp: `class Solution {
public:
    vector<int> removeDuplicates(vector<int>& nums) {
        int i = 0;
        for (int j = 1; j < (int)nums.size(); j++) {
            if (nums[j] != nums[i]) {
                i++;
                nums[i] = nums[j];
            }
        }
        return vector<int>(nums.begin(), nums.begin() + i + 1);
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote:
          "One pass, and the rearrangement happens inside nums (copying the result out is only for checking).",
      },
    ],
    doubts: [
      {
        q: "Why compare with nums[i] instead of nums[j - 1]?",
        a: "Both work here because the array is sorted, but comparing with nums[i], the last value kept, states the intent clearly and generalises to 'allow at most two duplicates' (LeetCode 80).",
      },
      {
        q: "Would this work on an unsorted array?",
        a: "No. It relies on duplicates being adjacent. For unsorted input you need a hash set to remember what you have seen.",
      },
    ],
    followUps: [
      "Remove Duplicates from Sorted Array II (LeetCode 80): each value may appear at most twice.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "move-zeroes",
    leetcode: 283,
    title: "Move Zeroes",
    difficulty: "Easy",
    topicId: "arrays",
    group: "In-place & Two Pointers",
    pattern: "Two pointers: write position for non-zeros",
    statement: [
      "Given an integer array `nums`, move all `0`s to the end while keeping the relative order of the non-zero elements.",
      "Do it in place, without making a copy of the array.",
    ],
    judgeNote: RETURN_ARRAY_NOTE,
    examples: [
      { input: args([0, 1, 0, 3, 12]), output: "[1,3,12,0,0]" },
      { input: args([0]), output: "[0]" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
    functionName: "moveZeroes",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number[]" },
    testCases: [
      { input: args([0, 1, 0, 3, 12]), expectedOutput: out([1, 3, 12, 0, 0]) },
      { input: args([0]), expectedOutput: out([0]) },
      { input: args([1, 2, 3]), expectedOutput: out([1, 2, 3]), isHidden: true },
      { input: args([0, 0, 1]), expectedOutput: out([1, 0, 0]), isHidden: true },
      { input: args([4, 0, 5, 0, 0, 6]), expectedOutput: out([4, 5, 6, 0, 0, 0]), isHidden: true },
      { input: args([-1, 0, 0, -2]), expectedOutput: out([-1, -2, 0, 0]), isHidden: true },
    ],
    hints: [
      "Where should the next non-zero element go?",
      "Keep a pointer to the next write position and swap each non-zero element into it.",
    ],
    check: {
      prompt: "nums = [0, 0, 7, 0, 5]. What is returned?",
      options: ["[7,5,0,0,0]", "[5,7,0,0,0]", "[0,0,0,7,5]", "[7,0,5,0,0]"],
      correctIndex: 0,
      explanation: "Non-zeros keep their order (7 then 5); the three zeros go to the end.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Copy the non-zeros to a temporary array, then fill the rest with zeros.",
        intuition: [
          "The final array is just 'all non-zeros in order, then zeros'. Collecting the non-zeros separately makes that easy, at the cost of extra memory.",
        ],
        steps: [
          "Collect every non-zero element into `temp`.",
          "Copy `temp` back to the start of `nums`.",
          "Set the remaining positions to 0.",
        ],
        code: {
          javascript: `var moveZeroes = function(nums) {
    const temp = nums.filter((x) => x !== 0);
    for (let i = 0; i < nums.length; i++) {
        nums[i] = i < temp.length ? temp[i] : 0;
    }
    return nums;
};`,
          python: `class Solution:
    def moveZeroes(self, nums: List[int]) -> List[int]:
        temp = [x for x in nums if x != 0]
        for i in range(len(nums)):
            nums[i] = temp[i] if i < len(temp) else 0
        return nums`,
          java: `class Solution {
    public int[] moveZeroes(int[] nums) {
        List<Integer> temp = new ArrayList<>();
        for (int x : nums) if (x != 0) temp.add(x);
        for (int i = 0; i < nums.length; i++) {
            nums[i] = i < temp.size() ? temp.get(i) : 0;
        }
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> moveZeroes(vector<int>& nums) {
        vector<int> temp;
        for (int x : nums) if (x != 0) temp.push_back(x);
        for (int i = 0; i < (int)nums.size(); i++) {
            nums[i] = i < (int)temp.size() ? temp[i] : 0;
        }
        return nums;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote: "Two passes; temp can hold up to n elements.",
      },
      {
        name: "Optimal",
        summary: "Pointer `j` is where the next non-zero belongs; swap each non-zero into it.",
        intuition: [
          "Scan with `i`. Every time we meet a non-zero, it belongs at position `j`, the first slot not yet holding a non-zero. Swapping it there moves a zero (if any) forward to `i`'s position. Non-zeros are placed in the order they appear, so their order is kept.",
        ],
        steps: [
          "Set `j = 0`.",
          "For each `i`: if `nums[i] != 0`, swap `nums[i]` and `nums[j]`, then `j++`.",
          "Return `nums`.",
        ],
        dryRun: {
          title: "nums = [0, 1, 0, 3, 12]",
          columns: ["i", "nums[i]", "Action", "j after", "Array"],
          rows: [
            ["0", "0", "zero, skip", "0", "[0,1,0,3,12]"],
            ["1", "1", "swap with j=0", "1", "[1,0,0,3,12]"],
            ["2", "0", "zero, skip", "1", "[1,0,0,3,12]"],
            ["3", "3", "swap with j=1", "2", "[1,3,0,0,12]"],
            ["4", "12", "swap with j=2", "3", "[1,3,12,0,0]"],
          ],
          result: "[1,3,12,0,0]",
        },
        code: {
          javascript: `var moveZeroes = function(nums) {
    let j = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            [nums[i], nums[j]] = [nums[j], nums[i]];
            j++;
        }
    }
    return nums;
};`,
          python: `class Solution:
    def moveZeroes(self, nums: List[int]) -> List[int]:
        j = 0
        for i in range(len(nums)):
            if nums[i] != 0:
                nums[i], nums[j] = nums[j], nums[i]
                j += 1
        return nums`,
          java: `class Solution {
    public int[] moveZeroes(int[] nums) {
        int j = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                int tmp = nums[i];
                nums[i] = nums[j];
                nums[j] = tmp;
                j++;
            }
        }
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> moveZeroes(vector<int>& nums) {
        int j = 0;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (nums[i] != 0) {
                swap(nums[i], nums[j]);
                j++;
            }
        }
        return nums;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "One pass, swaps happen in place.",
      },
    ],
    doubts: [
      {
        q: "Doesn't swapping move zeros around in the middle?",
        a: "Yes, temporarily. Everything before j is non-zero and everything between j and i is zero, so each swap simply moves a zero from position j to position i. At the end all zeros are behind all non-zeros.",
      },
      {
        q: "Why is the order of non-zeros preserved?",
        a: "Non-zeros are written to positions 0, 1, 2, ... in the same order i meets them.",
      },
    ],
    followUps: [
      "Do it with the minimum number of writes (only write when i != j).",
      "Move all negatives before positives, keeping order.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "rotate-array",
    leetcode: 189,
    title: "Rotate Array",
    difficulty: "Medium",
    topicId: "arrays",
    group: "In-place & Two Pointers",
    pattern: "Reversal trick",
    statement: [
      "Given an integer array `nums`, rotate it to the right by `k` steps, where `k` is non-negative.",
    ],
    judgeNote: RETURN_ARRAY_NOTE,
    examples: [
      {
        input: args([1, 2, 3, 4, 5, 6, 7], 3),
        output: "[5,6,7,1,2,3,4]",
        explanation:
          "Rotating right by 1: [7,1,2,3,4,5,6]. By 2: [6,7,1,2,3,4,5]. By 3: [5,6,7,1,2,3,4].",
      },
      { input: args([-1, -100, 3, 99], 2), output: "[3,99,-1,-100]" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1", "0 <= k <= 10^5"],
    functionName: "rotate",
    signature: {
      params: [
        { name: "nums", type: "number[]" },
        { name: "k", type: "number" },
      ],
      returnType: "number[]",
    },
    testCases: [
      { input: args([1, 2, 3, 4, 5, 6, 7], 3), expectedOutput: out([5, 6, 7, 1, 2, 3, 4]) },
      { input: args([-1, -100, 3, 99], 2), expectedOutput: out([3, 99, -1, -100]) },
      { input: args([1, 2], 3), expectedOutput: out([2, 1]), isHidden: true },
      { input: args([1], 0), expectedOutput: out([1]), isHidden: true },
      { input: args([1, 2, 3], 3), expectedOutput: out([1, 2, 3]), isHidden: true },
      {
        input: args([1, 2, 3, 4, 5, 6], 4),
        expectedOutput: out([3, 4, 5, 6, 1, 2]),
        isHidden: true,
      },
    ],
    hints: [
      "Rotating by n steps gives the same array, so only k % n matters.",
      "Where does the element at index i end up after rotating right by k?",
      "Try reversing the whole array, then reversing two parts of it.",
    ],
    check: {
      prompt: "nums = [1, 2, 3, 4], k = 5. What is returned?",
      options: ["[4,1,2,3]", "[2,3,4,1]", "[1,2,3,4]", "[3,4,1,2]"],
      correctIndex: 0,
      explanation: "k % 4 = 1, so it is a single right rotation.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Rotate by one step, k times.",
        intuition: [
          "A single right rotation is easy: remember the last element, shift everything right by one, and put the remembered element at the front. Repeating it k times (k reduced modulo n) gives the answer.",
        ],
        steps: [
          "Set `k = k % n`.",
          "Repeat k times: save `last = nums[n - 1]`, shift `nums[0..n-2]` one place right, set `nums[0] = last`.",
        ],
        code: {
          javascript: `var rotate = function(nums, k) {
    const n = nums.length;
    k %= n;
    for (let step = 0; step < k; step++) {
        const last = nums[n - 1];
        for (let i = n - 1; i > 0; i--) nums[i] = nums[i - 1];
        nums[0] = last;
    }
    return nums;
};`,
          python: `class Solution:
    def rotate(self, nums: List[int], k: int) -> List[int]:
        n = len(nums)
        for _ in range(k % n):
            last = nums[-1]
            for i in range(n - 1, 0, -1):
                nums[i] = nums[i - 1]
            nums[0] = last
        return nums`,
          java: `class Solution {
    public int[] rotate(int[] nums, int k) {
        int n = nums.length;
        k %= n;
        for (int step = 0; step < k; step++) {
            int last = nums[n - 1];
            for (int i = n - 1; i > 0; i--) nums[i] = nums[i - 1];
            nums[0] = last;
        }
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        for (int step = 0; step < k; step++) {
            int last = nums[n - 1];
            for (int i = n - 1; i > 0; i--) nums[i] = nums[i - 1];
            nums[0] = last;
        }
        return nums;
    }
};`,
        },
        time: "O(n · k)",
        space: "O(1)",
        complexityNote:
          "Each of the k rotations shifts n elements. With n and k up to 10^5 this times out.",
      },
      {
        name: "Better",
        summary: "Place each element directly at index (i + k) % n in a new array.",
        intuition: [
          "After rotating right by k, the element at index i moves to index (i + k) % n. Writing every element straight to its final position in a fresh array takes one pass.",
        ],
        steps: [
          "Create `res` of length n.",
          "For each i: `res[(i + k) % n] = nums[i]`.",
          "Copy `res` back into `nums`.",
        ],
        code: {
          javascript: `var rotate = function(nums, k) {
    const n = nums.length;
    const res = new Array(n);
    for (let i = 0; i < n; i++) res[(i + k) % n] = nums[i];
    for (let i = 0; i < n; i++) nums[i] = res[i];
    return nums;
};`,
          python: `class Solution:
    def rotate(self, nums: List[int], k: int) -> List[int]:
        n = len(nums)
        res = [0] * n
        for i in range(n):
            res[(i + k) % n] = nums[i]
        nums[:] = res
        return nums`,
          java: `class Solution {
    public int[] rotate(int[] nums, int k) {
        int n = nums.length;
        int[] res = new int[n];
        for (int i = 0; i < n; i++) res[(i + k) % n] = nums[i];
        System.arraycopy(res, 0, nums, 0, n);
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> rotate(vector<int>& nums, int k) {
        int n = nums.size();
        vector<int> res(n);
        for (int i = 0; i < n; i++) res[(i + k) % n] = nums[i];
        nums = res;
        return nums;
    }
};`,
        },
        time: "O(n)",
        space: "O(n)",
        complexityNote: "One pass to place and one to copy back, plus an extra array of size n.",
      },
      {
        name: "Optimal",
        summary:
          "Reverse the whole array, then reverse the first k and the remaining n − k elements.",
        intuition: [
          "Rotating right by k moves the last k elements to the front. Reversing the whole array brings those k elements to the front, but backwards, and the rest also backwards. Reversing each part again fixes both orders, all in place.",
        ],
        steps: [
          "Set `k = k % n`.",
          "Reverse `nums[0..n-1]`.",
          "Reverse `nums[0..k-1]`.",
          "Reverse `nums[k..n-1]`.",
        ],
        dryRun: {
          title: "nums = [1, 2, 3, 4, 5, 6, 7], k = 3",
          columns: ["Step", "Range reversed", "Array"],
          rows: [
            ["Start", "—", "[1,2,3,4,5,6,7]"],
            ["1", "whole array 0..6", "[7,6,5,4,3,2,1]"],
            ["2", "first k: 0..2", "[5,6,7,4,3,2,1]"],
            ["3", "rest: 3..6", "[5,6,7,1,2,3,4]"],
          ],
          result: "[5,6,7,1,2,3,4]",
        },
        code: {
          javascript: `var rotate = function(nums, k) {
    const n = nums.length;
    k %= n;
    const reverse = (l, r) => {
        while (l < r) {
            [nums[l], nums[r]] = [nums[r], nums[l]];
            l++;
            r--;
        }
    };
    reverse(0, n - 1);
    reverse(0, k - 1);
    reverse(k, n - 1);
    return nums;
};`,
          python: `class Solution:
    def rotate(self, nums: List[int], k: int) -> List[int]:
        n = len(nums)
        k %= n

        def reverse(l: int, r: int) -> None:
            while l < r:
                nums[l], nums[r] = nums[r], nums[l]
                l += 1
                r -= 1

        reverse(0, n - 1)
        reverse(0, k - 1)
        reverse(k, n - 1)
        return nums`,
          java: `class Solution {
    public int[] rotate(int[] nums, int k) {
        int n = nums.length;
        k %= n;
        reverse(nums, 0, n - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, n - 1);
        return nums;
    }

    private void reverse(int[] nums, int l, int r) {
        while (l < r) {
            int tmp = nums[l];
            nums[l++] = nums[r];
            nums[r--] = tmp;
        }
    }
}`,
          cpp: `class Solution {
public:
    vector<int> rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
        return nums;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "Every element is swapped at most twice; no extra array.",
      },
    ],
    doubts: [
      {
        q: "Why k % n?",
        a: "Rotating n times returns the original array, so k = 10 on an array of length 7 is the same as k = 3. Without it the indexes in the reversal steps go out of range.",
      },
      {
        q: "How would I rotate to the left instead?",
        a: "Left by k equals right by n − k. Or with reversals: reverse the first k, reverse the rest, then reverse the whole array.",
      },
    ],
    followUps: [
      "Rotate a matrix by 90 degrees in place (LeetCode 48).",
      "Do the in-place rotation with cyclic replacements instead of reversals.",
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: "sort-colors",
    leetcode: 75,
    title: "Sort Colors",
    difficulty: "Medium",
    topicId: "arrays",
    group: "In-place & Two Pointers",
    pattern: "Dutch National Flag (three pointers)",
    statement: [
      "Given an array `nums` with values `0`, `1` and `2` (red, white and blue), sort it in place so that objects of the same colour are adjacent, in the order 0, 1, 2.",
      "Solve it without using the library's sort function.",
    ],
    judgeNote: RETURN_ARRAY_NOTE,
    examples: [
      { input: args([2, 0, 2, 1, 1, 0]), output: "[0,0,1,1,2,2]" },
      { input: args([2, 0, 1]), output: "[0,1,2]" },
    ],
    constraints: ["1 <= nums.length <= 300", "nums[i] is 0, 1 or 2."],
    functionName: "sortColors",
    signature: { params: [{ name: "nums", type: "number[]" }], returnType: "number[]" },
    testCases: [
      { input: args([2, 0, 2, 1, 1, 0]), expectedOutput: out([0, 0, 1, 1, 2, 2]) },
      { input: args([2, 0, 1]), expectedOutput: out([0, 1, 2]) },
      { input: args([0]), expectedOutput: out([0]), isHidden: true },
      { input: args([1, 1, 1]), expectedOutput: out([1, 1, 1]), isHidden: true },
      { input: args([2, 2, 0, 0, 1, 1]), expectedOutput: out([0, 0, 1, 1, 2, 2]), isHidden: true },
      { input: args([1, 0]), expectedOutput: out([0, 1]), isHidden: true },
    ],
    hints: [
      "There are only three distinct values. Could you count them?",
      "One pass is possible: keep the 0s at the front, the 2s at the back, and the 1s in the middle.",
    ],
    check: {
      prompt: "nums = [1, 2, 0]. What is returned?",
      options: ["[0,1,2]", "[2,1,0]", "[1,0,2]", "[0,2,1]"],
      correctIndex: 0,
      explanation: "All 0s first, then 1s, then 2s.",
    },
    approaches: [
      {
        name: "Brute Force",
        summary: "Use any sorting algorithm.",
        intuition: [
          "Sorting obviously produces 0s, then 1s, then 2s. It ignores the fact that there are only three values, so it does more work than needed.",
        ],
        steps: ["Sort the array in ascending order and return it."],
        code: {
          javascript: `var sortColors = function(nums) {
    return nums.sort((a, b) => a - b);
};`,
          python: `class Solution:
    def sortColors(self, nums: List[int]) -> List[int]:
        nums.sort()
        return nums`,
          java: `class Solution {
    public int[] sortColors(int[] nums) {
        Arrays.sort(nums);
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> sortColors(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        return nums;
    }
};`,
        },
        time: "O(n log n)",
        space: "O(1)",
        complexityNote: "Comparison sorting costs n log n (ignoring the sort's internal stack).",
      },
      {
        name: "Better",
        summary: "Count the 0s, 1s and 2s, then overwrite the array.",
        intuition: [
          "With only three possible values, counting them tells us exactly what the sorted array looks like.",
        ],
        steps: ["Count how many 0s, 1s and 2s there are.", "Write that many 0s, then 1s, then 2s."],
        code: {
          javascript: `var sortColors = function(nums) {
    const count = [0, 0, 0];
    for (const x of nums) count[x]++;
    let i = 0;
    for (let color = 0; color < 3; color++) {
        for (let c = 0; c < count[color]; c++) nums[i++] = color;
    }
    return nums;
};`,
          python: `class Solution:
    def sortColors(self, nums: List[int]) -> List[int]:
        count = [0, 0, 0]
        for x in nums:
            count[x] += 1
        i = 0
        for color in range(3):
            for _ in range(count[color]):
                nums[i] = color
                i += 1
        return nums`,
          java: `class Solution {
    public int[] sortColors(int[] nums) {
        int[] count = new int[3];
        for (int x : nums) count[x]++;
        int i = 0;
        for (int color = 0; color < 3; color++) {
            for (int c = 0; c < count[color]; c++) nums[i++] = color;
        }
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> sortColors(vector<int>& nums) {
        int count[3] = {0, 0, 0};
        for (int x : nums) count[x]++;
        int i = 0;
        for (int color = 0; color < 3; color++) {
            for (int c = 0; c < count[color]; c++) nums[i++] = color;
        }
        return nums;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote: "Two passes (count, then write) with a fixed-size counter.",
      },
      {
        name: "Optimal",
        summary: "Dutch National Flag: `low`, `mid` and `high` pointers sort in one pass.",
        intuition: [
          "Keep three regions: `[0..low-1]` are 0s, `[low..mid-1]` are 1s, `[high+1..n-1]` are 2s, and `[mid..high]` is still unknown. Look at `nums[mid]`: a 0 is swapped to the 0 region, a 1 is already in place, a 2 is swapped to the 2 region. The unknown region shrinks every step.",
        ],
        steps: [
          "Set `low = 0`, `mid = 0`, `high = n - 1`.",
          "While `mid <= high`:",
          "If `nums[mid] == 0`: swap `nums[low]` and `nums[mid]`, then `low++` and `mid++`.",
          "If `nums[mid] == 1`: `mid++`.",
          "If `nums[mid] == 2`: swap `nums[mid]` and `nums[high]`, then `high--` (do not move `mid`: the swapped-in value is unchecked).",
        ],
        dryRun: {
          title: "nums = [2, 0, 2, 1, 1, 0]",
          columns: ["low", "mid", "high", "nums[mid]", "Action", "Array after"],
          rows: [
            ["0", "0", "5", "2", "swap mid↔high, high--", "[0,0,2,1,1,2]"],
            ["0", "0", "4", "0", "swap low↔mid, low++, mid++", "[0,0,2,1,1,2]"],
            ["1", "1", "4", "0", "swap low↔mid, low++, mid++", "[0,0,2,1,1,2]"],
            ["2", "2", "4", "2", "swap mid↔high, high--", "[0,0,1,1,2,2]"],
            ["2", "2", "3", "1", "mid++", "[0,0,1,1,2,2]"],
            ["2", "3", "3", "1", "mid++ (mid > high, stop)", "[0,0,1,1,2,2]"],
          ],
          result: "[0,0,1,1,2,2]",
        },
        code: {
          javascript: `var sortColors = function(nums) {
    let low = 0, mid = 0, high = nums.length - 1;
    while (mid <= high) {
        if (nums[mid] === 0) {
            [nums[low], nums[mid]] = [nums[mid], nums[low]];
            low++;
            mid++;
        } else if (nums[mid] === 1) {
            mid++;
        } else {
            [nums[mid], nums[high]] = [nums[high], nums[mid]];
            high--;
        }
    }
    return nums;
};`,
          python: `class Solution:
    def sortColors(self, nums: List[int]) -> List[int]:
        low = mid = 0
        high = len(nums) - 1
        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1
        return nums`,
          java: `class Solution {
    public int[] sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int tmp = nums[low]; nums[low] = nums[mid]; nums[mid] = tmp;
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int tmp = nums[mid]; nums[mid] = nums[high]; nums[high] = tmp;
                high--;
            }
        }
        return nums;
    }
}`,
          cpp: `class Solution {
public:
    vector<int> sortColors(vector<int>& nums) {
        int low = 0, mid = 0, high = (int)nums.size() - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low++], nums[mid++]);
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums[mid], nums[high--]);
            }
        }
        return nums;
    }
};`,
        },
        time: "O(n)",
        space: "O(1)",
        complexityNote:
          "Each step either moves mid forward or high backward, so there are at most n steps.",
      },
    ],
    doubts: [
      {
        q: "Why don't we increment mid after swapping with high?",
        a: "The value that arrives at mid from high has not been examined yet. It might be 0 or 2, so we must check it in the next iteration.",
      },
      {
        q: "Why is it safe to increment mid after swapping with low?",
        a: "Everything between low and mid - 1 is already 1, so the value coming back from low is a 1 (or the same element when low == mid). It needs no further checking.",
      },
    ],
    followUps: [
      "Sort an array of 0s and 1s in one pass.",
      "Partition around a pivot into < pivot, = pivot and > pivot (the core of 3-way quicksort).",
    ],
  },
];
