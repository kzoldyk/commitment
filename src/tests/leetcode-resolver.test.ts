import { describe, it, expect } from 'vitest';
import { resolveLeetCodeProblem } from '../server/modules/leetcode/leetcode.resolver';

describe('LeetCode Resolver Engine', () => {
  it('should auto-resolve problem #704 as Binary Search with Easy difficulty', async () => {
    const problem = await resolveLeetCodeProblem(704);
    expect(problem).not.toBeNull();
    expect(problem?.id).toBe(704);
    expect(problem?.title).toBe('Binary Search');
    expect(problem?.difficulty).toBe('Easy');
    expect(problem?.url).toBe('https://leetcode.com/problems/binary-search/');
  });

  it('should auto-resolve problem #1 as Two Sum', async () => {
    const problem = await resolveLeetCodeProblem('1');
    expect(problem).not.toBeNull();
    expect(problem?.id).toBe(1);
    expect(problem?.title).toBe('Two Sum');
    expect(problem?.difficulty).toBe('Easy');
  });

  it('should auto-resolve problem #42 as Trapping Rain Water with Hard difficulty', async () => {
    const problem = await resolveLeetCodeProblem(42);
    expect(problem).not.toBeNull();
    expect(problem?.title).toBe('Trapping Rain Water');
    expect(problem?.difficulty).toBe('Hard');
  });

  it('should return null for non-existent problem numbers gracefully', async () => {
    const problem = await resolveLeetCodeProblem(999999);
    expect(problem).toBeNull();
  });
});
