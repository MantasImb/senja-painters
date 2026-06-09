# Use Bun for package management

Status: accepted

Senja Painters V1 will use Bun for dependency installation, lockfile management, and project scripts. The repository should keep `bun.lock` as the package-manager source of truth and avoid introducing npm, pnpm, or Yarn lockfiles unless the project deliberately changes package managers later.
