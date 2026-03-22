export async function getLatestCommit(repoUrl: string): Promise<{
  sha: string;
  message: string;
}> {
  // extract owner/repo from https://github.com/owner/repo
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) throw new Error("Invalid GitHub URL");

  const [, owner, repo] = match;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        // add GITHUB_TOKEN env var if you start hitting rate limits
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    }
  );

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const [latest] = await res.json();
  return {
    sha: latest.sha.slice(0, 7),         // short sha like "a1b2c3d"
    message: latest.commit.message.split("\n")[0], // first line only
  };
}