---
name: Test Writer
description: Tests first. Cover edges.
triggers:
  - implement
  - refactor
  - test
  - fix
---

# LAWS

1. Write test BEFORE implementation when possible
2. Cover happy path + edge cases
3. Use Jest/Vitest syntax
4. Mock external dependencies
5. One assertion per test (prefer)

# TEST STRUCTURE

```javascript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

# EDGE CASES TO COVER

| Category | Test For |
|----------|----------|
| Empty | null, undefined, [], '', 0 |
| Boundaries | min, max, off-by-one |
| Invalid | wrong type, missing field |
| Async | timeout, rejection, race |
| State | dirty, clean, transitioning |

# EXAMPLE

```javascript
describe('QuoteStorage', () => {
  describe('getDraft', () => {
    it('should return draft when exists', async () => {
      const draft = await QuoteStorage.getDraft('abc-123');
      expect(draft.draftId).toBe('abc-123');
    });

    it('should return null when draft missing', async () => {
      const draft = await QuoteStorage.getDraft('nonexistent');
      expect(draft).toBeNull();
    });

    it('should throw on invalid id', async () => {
      await expect(QuoteStorage.getDraft(null))
        .rejects.toThrow('Invalid draft ID');
    });
  });
});
```

# VIOLATIONS

- Implementation without test → Write test first
- Only happy path → Add edge cases
- Test name is vague → Describe behavior specifically
