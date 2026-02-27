"use server";

export interface ValidateRepoResult {
  valid: boolean;
  error?: string;
  defaultBranch?: string;
  branches?: string[];
  framework?: string;
  description?: string;
  stars?: number;
}

const FRAMEWORK_DETECTORS: {
  name: string;
  check: (pkg: Record<string, unknown>) => boolean;
}[] = [
  {
    name: "next",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "next" in deps;
    },
  },
  {
    name: "nuxt",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "nuxt" in deps || "nuxt3" in deps;
    },
  },
  {
    name: "remix",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "@remix-run/react" in deps || "@remix-run/node" in deps;
    },
  },
  {
    name: "svelte",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "svelte" in deps || "@sveltejs/kit" in deps;
    },
  },
  {
    name: "astro",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "astro" in deps;
    },
  },
  {
    name: "angular",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "@angular/core" in deps;
    },
  },
  {
    name: "vue",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "vue" in deps;
    },
  },
  {
    name: "gatsby",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "gatsby" in deps;
    },
  },
  {
    name: "vite",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "vite" in deps && !("vue" in deps) && !("svelte" in deps);
    },
  },
  {
    name: "react",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "react" in deps;
    },
  },
  {
    name: "express",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "express" in deps;
    },
  },
  {
    name: "fastify",
    check: (pkg) => {
      const deps = {
        ...(pkg.dependencies as Record<string, string> | undefined),
        ...(pkg.devDependencies as Record<string, string> | undefined),
      };
      return "fastify" in deps;
    },
  },
];

function extractOwnerRepo(url: string): { owner: string; repo: string } | null {
  const match = url
    .trim()
    .replace(/\.git$/, "")
    .match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function githubFetch(path: string, token: string | undefined) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Hostifer-Deploy",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`https://api.github.com${path}`, { headers });
}

async function detectFramework(
  owner: string,
  repo: string,
  defaultBranch: string,
  token: string | undefined,
): Promise<string> {
  // Try package.json first
  try {
    const res = await githubFetch(
      `/repos/${owner}/${repo}/contents/package.json?ref=${defaultBranch}`,
      token,
    );
    if (res.ok) {
      const data = await res.json();
      // content is base64 encoded
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      const pkg = JSON.parse(content);

      for (const detector of FRAMEWORK_DETECTORS) {
        if (detector.check(pkg)) {
          return detector.name;
        }
      }

      // It's a Node.js project but no specific framework detected
      return "node";
    }
  } catch {
    // ignore – file doesn't exist or parse error
  }

  // Check for other project indicators
  const fileChecks: { path: string; framework: string }[] = [
    { path: "requirements.txt", framework: "python" },
    { path: "pyproject.toml", framework: "python" },
    { path: "setup.py", framework: "python" },
    { path: "Cargo.toml", framework: "rust" },
    { path: "go.mod", framework: "go" },
    { path: "pom.xml", framework: "java" },
    { path: "build.gradle", framework: "java" },
    { path: "Gemfile", framework: "ruby" },
    { path: "mix.exs", framework: "elixir" },
    { path: "composer.json", framework: "php" },
    { path: "Dockerfile", framework: "docker" },
  ];

  for (const check of fileChecks) {
    try {
      const res = await githubFetch(
        `/repos/${owner}/${repo}/contents/${check.path}?ref=${defaultBranch}`,
        token,
      );
      if (res.ok) {
        return check.framework;
      }
    } catch {
      // ignore
    }
  }

  return "not-detected";
}

async function fetchBranches(
  owner: string,
  repo: string,
  token: string | undefined,
): Promise<string[]> {
  try {
    // Fetch up to 100 branches (paginated)
    const res = await githubFetch(
      `/repos/${owner}/${repo}/branches?per_page=100`,
      token,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data as { name: string }[]).map((b) => b.name);
  } catch {
    return [];
  }
}

export async function validateRepo(
  repoUrl: string,
): Promise<ValidateRepoResult> {
  const parsed = extractOwnerRepo(repoUrl);
  if (!parsed) {
    return {
      valid: false,
      error:
        "Invalid GitHub URL. Expected format: https://github.com/owner/repo",
    };
  }

  const token = process.env.GITHUB_TOKEN;
  const { owner, repo } = parsed;

  try {
    const res = await githubFetch(`/repos/${owner}/${repo}`, token);

    if (res.status === 404) {
      return {
        valid: false,
        error:
          "Repository not found. Make sure the repository exists and is public.",
      };
    }

    if (res.status === 403) {
      return {
        valid: false,
        error: "API rate limit exceeded. Please try again later.",
      };
    }

    if (!res.ok) {
      return {
        valid: false,
        error: `GitHub API error (${res.status}). Please try again.`,
      };
    }

    const data = await res.json();

    if (data.private) {
      return {
        valid: false,
        error:
          "This repository is private. Only public repositories are supported.",
      };
    }

    const defaultBranch: string = data.default_branch || "main";

    // Fetch branches and framework in parallel
    const [framework, branches] = await Promise.all([
      detectFramework(owner, repo, defaultBranch, token),
      fetchBranches(owner, repo, token),
    ]);

    return {
      valid: true,
      defaultBranch,
      branches,
      framework,
      description: data.description || undefined,
      stars: data.stargazers_count,
    };
  } catch {
    return {
      valid: false,
      error:
        "Failed to connect to GitHub. Please check your connection and try again.",
    };
  }
}
