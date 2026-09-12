# AGENTS.md

This file gives instructions to any AI coding agent working in this repository.
The primary goal is long-term maintainability by a human, not just working code.
Optimize for the next person reading this in six months with zero context.

> For a brand-new project with no established conventions, propose and document
> conventions for structure, naming, error handling, and logging before writing
> feature code. Get maintainer sign-off, then treat those conventions as fixed.

## 1. Before writing code

- If a requirement is ambiguous, ask. Do not silently pick an interpretation.
- State architectural changes before implementing them.
- Check for existing utilities and patterns before creating new ones.
- Prefer the smallest change that solves the problem.
- Do not refactor unrelated code unless requested.

## 2. Project structure

- Follow the existing folder structure; do not introduce a competing structure.
- If no structure exists, propose and document one before building features.
- Maintain one clear location for configuration, constants, types, business
  logic, routes, and tests.
- Keep related logic together.

## 3. Naming

- Use descriptive names and avoid abbreviations.
- Name functions with verbs and variables with nouns.
- Match the convention already used by the file and repository.
- If no convention exists, state one and apply it consistently.

## 4. Code shape

- Give each function one responsibility.
- Keep files below a soft ceiling of approximately 300–400 lines.
- Avoid more than approximately three levels of nesting.
- Prefer explicit code over clever one-liners.

## 5. Comments and documentation

- Comment why, not what.
- Give every public function or module a short docstring covering its purpose,
  parameters, return value, and edge cases.
- Update relevant documentation when behavior or structure changes.

## 6. Configuration and secrets

- Put configuration in environment variables or configuration files.
- Centralize repeated values as named constants.
- Never commit secrets, API keys, or credentials.

## 7. Errors and logging

- Follow the repository's established error-handling pattern.
- If none exists, establish and document one before adding feature code.
- Make error messages specific and actionable.
- Use structured logging with context and remove debug logs before finishing.

## 8. Testing

- Add at least a basic test for new features and functions.
- Name tests after observable behavior.
- Mirror the source structure in the test structure.
- Run the existing test suite before declaring work complete.

## 9. Dependencies

- Justify new dependencies in the final summary.
- Check whether a suitable dependency already exists before adding one.
- Pin dependency versions.

## 10. Git and commits

- Name every feature branch with the `feature/` prefix, followed by a concise,
  descriptive kebab-case name.
- Keep commits small and focused, with one logical change per commit.
- Explain what changed and why in commit messages.
- Delete dead code instead of commenting it out.
- Do not mix formatting-only changes with logic changes.

## 11. Scalability

- Design for the current requirement rather than hypothetical future needs.
- Depend on contracts rather than another module's internals.
- Add abstractions only when a second real use case exists.

## 12. Definition of done

Before marking work complete, confirm:

- Code follows the repository's established structure, naming, and patterns.
- No hardcoded values or dead code remain.
- Relevant tests exist and pass.
- Documentation is current.
- The final summary explains why the change was made.

## 13. When in doubt

Ask the maintainer instead of making an assumption that is expensive to undo.
