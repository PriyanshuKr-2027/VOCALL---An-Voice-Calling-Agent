---
name: swe-principles
description: Apply software engineering principles from SWEBOK — cohesion, coupling, file size limits, SOLID, DRY, KISS, modularity, abstraction, encapsulation, and separation of concerns — to any codebase or design. Use this skill whenever someone asks how code should be structured, how big files should be, whether a module is too coupled, whether a class has too many responsibilities, or needs a code quality health check against engineering best practices. Also trigger for: "is this code well-structured?", "how should I organize this?", "is this file too long?", "is this coupling bad?", "refactor this for maintainability", "SWE best practices", "clean code review", "SOLID principles check".
---

# Software Engineering Principles (SWEBOK-based)

A rulebook for how code should be structured, sized, and organized — based on SWEBOK v4, Clean Code, and industry-standard software engineering principles.

---

## The Core Question Framework

When evaluating any code structure, ask:
1. **Is this unit doing one thing?** (Cohesion)
2. **Does this unit know too much about others?** (Coupling)
3. **Could I understand this without reading everything else?** (Abstraction)
4. **Is this the right size?** (Module sizing)
5. **Is anything duplicated?** (DRY)
6. **Is this the simplest it can be?** (KISS)

---

## 1. File & Module Sizing

### Hard Limits
| Unit | Recommended | Warning Zone | Refactor Required |
|------|-------------|--------------|-------------------|
| **Function / Method** | ≤ 20 lines | 20–40 lines | > 40 lines |
| **Class / Component** | ≤ 200 lines | 200–400 lines | > 400 lines |
| **File / Module** | ≤ 300 lines | 300–500 lines | > 500 lines |
| **Package / Directory** | ≤ 10 files | 10–20 files | > 20 files |

> **Why these limits?** Research (SWEBOK §3, McCabe complexity) shows comprehension drops sharply after ~50 lines. A developer can hold ~7 ± 2 concepts in working memory at once — a 500-line file exceeds this by 10×.

### What to do when a file grows too large
1. **Extract classes** — group related methods into a new class
2. **Extract modules** — split by feature domain, not alphabetically
3. **Apply the Single Responsibility** — one file = one reason to change
4. **Introduce layers** — separate data, logic, and presentation

---

## 2. Cohesion (HIGH is good)

Cohesion measures how closely related the responsibilities inside a module are.

### Cohesion Scale (best to worst)
| Level | Name | Description | Example |
|-------|------|-------------|---------|
| 7 | **Functional** ✅ | One well-defined job | `calculateTax()` |
| 6 | **Sequential** ✅ | Output of one step → input of next | Pipeline processors |
| 5 | **Communicational** ✅ | Same data, different operations | `UserProfileService` |
| 4 | **Procedural** ⚠️ | Execution order matters, loosely related | Multi-step wizard |
| 3 | **Temporal** ⚠️ | Things that happen at the same time | `initializeApp()` dumping unrelated inits |
| 2 | **Logical** ❌ | Grouped by type, not purpose | `StringUtils` with 40 unrelated methods |
| 1 | **Coincidental** ❌ | No relationship at all | `Misc.java`, `helpers.ts` |

### Cohesion Code Smells
- A class with "And" in its name: `UserParserAndValidator`
- A util/helper file with > 10 unrelated functions
- Methods that don't use `this` / `self` (often belong elsewhere)
- A module imported by > 15 other modules (God Module)

---

## 3. Coupling (LOW is good)

Coupling measures how dependent modules are on each other.

### Coupling Scale (best to worst)
| Level | Name | Description | Fix |
|-------|------|-------------|-----|
| 1 | **Data** ✅ | Only primitive params passed | Keep it |
| 2 | **Stamp** ✅ | Whole object passed, subset used | Extract needed fields |
| 3 | **Control** ⚠️ | Flag passed to control flow | Split into 2 functions |
| 4 | **External** ⚠️ | Depends on external format/protocol | Wrap in adapter |
| 5 | **Common** ❌ | Shared global state | Inject dependencies |
| 6 | **Content** ❌ | Directly modifies another module's internals | Encapsulate |

### Fan-Out / Fan-In Metrics
- **Fan-Out** (how many modules this one calls): Keep < 7
- **Fan-In** (how many modules call this one): High is OK (means reusable)
- **Instability** = Fan-Out / (Fan-In + Fan-Out) → aim for 0 (stable) or 1 (flexible leaf)

### Coupling Code Smells
- Importing a module just to call `module.submodule.util.helper()`
- A change in Module A always requires a change in Module B
- Circular dependencies (A → B → C → A)
- `import *` from another module
- Accessing `obj._private_field` from outside

---

## 4. SOLID Principles

### S — Single Responsibility Principle
> A class/module should have **one reason to change**.

❌ Bad: `UserService` that validates, saves to DB, sends emails, and formats reports  
✅ Good: `UserValidator`, `UserRepository`, `UserNotifier`, `UserReportFormatter`

**Test**: Name all the reasons this class might change. More than one? Split it.

### O — Open/Closed Principle
> Open for extension, closed for modification.

❌ Bad: `if type == "A"... elif type == "B"...` growing switch statements  
✅ Good: Strategy pattern, polymorphism, plugin interfaces

### L — Liskov Substitution Principle
> Subclasses must be substitutable for their parent without breaking behavior.

❌ Bad: `Square extends Rectangle` where setting width changes height  
✅ Good: `Shape` with `area()` — each subclass truly IS-A Shape

### I — Interface Segregation Principle
> No client should be forced to depend on methods it doesn't use.

❌ Bad: One `IAnimal` interface with `fly()`, `swim()`, `bark()`  
✅ Good: `IFlyable`, `ISwimmable`, `IBarkable` — compose as needed

### D — Dependency Inversion Principle
> High-level modules should not depend on low-level modules. Both should depend on abstractions.

❌ Bad: `OrderService` directly instantiates `MySQLDatabase`  
✅ Good: `OrderService` depends on `IDatabase` interface; inject the implementation

---

## 5. DRY — Don't Repeat Yourself

> Every piece of knowledge must have a **single, authoritative representation** in the system.

### Types of Duplication
| Type | Example | Fix |
|------|---------|-----|
| **Code duplication** | Same logic copy-pasted | Extract function |
| **Data duplication** | Same constant in 3 files | Single source of truth |
| **Logic duplication** | Same validation in UI + API + DB | Shared validation layer |
| **Documentation duplication** | Comment explains what code already says | Delete the comment |

> **Rule of Three**: First time → write it. Second time → note the duplication. Third time → extract it.

---

## 6. KISS — Keep It Simple, Stupid

> The best code is the code that doesn't need to be explained.

### Complexity Metrics
- **Cyclomatic Complexity**: Number of independent paths through a function
  - ≤ 5: Simple ✅
  - 6–10: Moderate ⚠️ (add tests)
  - 11–20: Complex ❌ (refactor)
  - > 20: Untestable 🔴 (must refactor)

- **Cognitive Complexity** (Sonar): How hard is it to understand?
  - Nested ifs multiply complexity
  - Early returns reduce it

### Simplicity Rules
- Prefer early returns over nested ifs
- Prefer immutable data structures
- Name things clearly instead of commenting
- One level of abstraction per function
- Avoid premature optimization — profile first

---

## 7. Abstraction Layers

Good systems have clear layers. Each layer should only talk to the adjacent layer.

```
┌─────────────────────────────────┐
│  Presentation / UI              │  ← knows about views, components
├─────────────────────────────────┤
│  Application / Use Cases        │  ← orchestrates business flow
├─────────────────────────────────┤
│  Domain / Business Logic        │  ← pure business rules
├─────────────────────────────────┤
│  Infrastructure / Data Access   │  ← DB, APIs, file system
└─────────────────────────────────┘
```

**Violation smell**: SQL query inside a React component. Business logic inside a DB trigger.

---

## 8. Separation of Concerns (SoC)

Every module addresses a separate concern. Concerns include:
- **Data persistence** (how data is stored)
- **Business rules** (what the app does)
- **Presentation** (how it looks)
- **Communication** (how it talks to others)
- **Error handling** (what happens when things go wrong)
- **Configuration** (environment-specific settings)
- **Logging/Observability** (cross-cutting concern → use AOP/middleware)

---

## 9. Naming Standards

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | Descriptive noun | `userAccountBalance`, not `x` |
| Functions | Verb + noun | `calculateTax()`, `fetchUser()` |
| Boolean | Is/has/can prefix | `isValid`, `hasPermission` |
| Classes | Noun (PascalCase) | `InvoiceProcessor` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Files | Match main export | `UserService.ts` for `class UserService` |

**Magic numbers**: Replace `if age > 18` with `if age > LEGAL_AGE`

---

## 10. Code Health Scorecard

Use this to rate any codebase 1–5:

| Principle | Score | Notes |
|-----------|-------|-------|
| File sizes within limits | /5 | |
| High cohesion | /5 | |
| Low coupling | /5 | |
| SOLID compliance | /5 | |
| DRY (no duplication) | /5 | |
| KISS (low complexity) | /5 | |
| Clear naming | /5 | |
| Proper layering | /5 | |
| **Total** | /40 | |

- 35–40: Excellent codebase
- 25–34: Good, minor issues
- 15–24: Technical debt accumulating
- < 15: Requires significant refactoring

---

## Output Format

When evaluating code against these principles, always produce:

```markdown
## SWE Principles Assessment

### Summary
[1-2 sentences overall health]

### Violations Found
| Principle | Location | Severity | Description |
|-----------|----------|----------|-------------|
| Cohesion | UserService.ts:1-350 | 🔴 High | Class handles auth, email, and reporting |
| File Size | utils.js | 🟡 Med | 487 lines — approaching limit |

### Recommended Refactors
1. **Extract [X] from [Y]** — reason
2. **Introduce interface for [Z]** — reason

### Health Score: [X]/40
```
