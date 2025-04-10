export const codingQuestions = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            }
        ],
        constraints: [
            "2 <= nums.length <= 104",
            "-109 <= nums[i] <= 109",
            "-109 <= target <= 109"
        ],
        starterCode: `function twoSum(nums, target) {
    // Write your code here
}`
    },
    {
        id: 2,
        title: "Palindrome Number",
        difficulty: "Easy",
        description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
        examples: [
            {
                input: "x = 121",
                output: "true",
                explanation: "121 reads as 121 from left to right and right to left."
            },
            {
                input: "x = -121",
                output: "false",
                explanation: "-121 reads as 121- from right to left, so it’s not a palindrome."
            }
        ],
        constraints: [
            "-231 <= x <= 231 - 1"
        ],
        starterCode: `function isPalindrome(x) {
    // Write your code here
}`
    },
    {
        id: 3,
        title: "Longest Common Prefix",
        difficulty: "Easy",
        description: "Write a function to find the longest common prefix string amongst an array of strings.",
        examples: [
            {
                input: 'strs = ["flower","flow","flight"]',
                output: '"fl"',
                explanation: "The longest common prefix is 'fl'."
            },
            {
                input: 'strs = ["dog","racecar","car"]',
                output: '""',
                explanation: "There is no common prefix."
            }
        ],
        constraints: [
            "0 <= strs.length <= 200",
            "0 <= strs[i].length <= 200",
            "strs[i] consists of only lowercase English letters."
        ],
        starterCode: `function longestCommonPrefix(strs) {
    // Write your code here
}`
    },
    {
        id: 4,
        title: "Valid Parentheses",
        difficulty: "Easy",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        examples: [
            {
                input: 's = "()"',
                output: "true",
                explanation: "The string contains valid parentheses."
            },
            {
                input: 's = "(]"',
                output: "false",
                explanation: "Parentheses are not properly closed."
            }
        ],
        constraints: [
            "1 <= s.length <= 104",
            "s consists of parentheses only '()[]{}'."
        ],
        starterCode: `function isValid(s) {
    // Write your code here
}`
    },
    {
        id: 5,
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        description: "Merge two sorted linked lists and return it as a sorted list.",
        examples: [
            {
                input: "list1 = [1,2,4], list2 = [1,3,4]",
                output: "[1,1,2,3,4,4]",
                explanation: "Lists are merged and sorted."
            }
        ],
        constraints: [
            "The number of nodes in both lists is in the range [0, 50].",
            "-100 <= Node.val <= 100"
        ],
        starterCode: `function mergeTwoLists(list1, list2) {
    // Write your code here
}`
    },
    {
        id: 6,
        title: "Remove Duplicates from Sorted Array",
        difficulty: "Easy",
        description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place.",
        examples: [
            {
                input: "nums = [1,1,2]",
                output: "[1,2]",
                explanation: "Duplicates are removed in-place."
            }
        ],
        constraints: [
            "1 <= nums.length <= 3 * 104",
            "-100 <= nums[i] <= 100"
        ],
        starterCode: `function removeDuplicates(nums) {
    // Write your code here
}`
    },
    {
        id: 7,
        title: "Climbing Stairs",
        difficulty: "Easy",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
        examples: [
            {
                input: "n = 2",
                output: "2",
                explanation: "There are two ways to climb to the top."
            },
            {
                input: "n = 3",
                output: "3",
                explanation: "There are three ways to climb to the top."
            }
        ],
        constraints: [
            "1 <= n <= 45"
        ],
        starterCode: `function climbStairs(n) {
    // Write your code here
}`
    },
    {
        id: 8,
        title: "Maximum Subarray",
        difficulty: "Medium",
        description: "Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.",
        examples: [
            {
                input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The contiguous subarray [4,-1,2,1] has the largest sum = 6."
            }
        ],
        constraints: [
            "1 <= nums.length <= 105",
            "-104 <= nums[i] <= 104"
        ],
        starterCode: `function maxSubArray(nums) {
    // Write your code here
}`
    },
    {
        id: 9,
        title: "Jump Game",
        difficulty: "Medium",
        description: "You are given an integer array nums. Each element represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
        examples: [
            {
                input: "nums = [2,3,1,1,4]",
                output: "true",
                explanation: "You can reach the last index by jumping to index 1 (3 steps), then to the last index."
            },
            {
                input: "nums = [3,2,1,0,4]",
                output: "false",
                explanation: "You can't reach the last index."
            }
        ],
        constraints: [
            "1 <= nums.length <= 104",
            "0 <= nums[i] <= 1000"
        ],
        starterCode: `function canJump(nums) {
    // Write your code here
}`
    },
    {
        id: 10,
        title: "Product of Array Except Self",
        difficulty: "Medium",
        description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
        examples: [
            {
                input: "nums = [1,2,3,4]",
                output: "[24,12,8,6]",
                explanation: "Product of elements except self at each index."
            }
        ],
        constraints: [
            "2 <= nums.length <= 105",
            "1 <= nums[i] <= 30"
        ],
        starterCode: `function productExceptSelf(nums) {
    // Write your code here
}`
    }
];
