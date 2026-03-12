// GitHub API utility for auto-commit
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // format: username/repo
const BRANCH = 'main';

async function getRepoInfo() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    throw new Error('Missing GITHUB_TOKEN or GITHUB_REPO in .env.local');
  }
  const [owner, repo] = GITHUB_REPO.split('/');
  return { owner, repo };
}

export async function commitToGitHub(filePath: string, content: string, message: string) {
  const { owner, repo } = await getRepoInfo();
  
  // Get the current file SHA (if exists)
  let sha = '';
  try {
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
    }
  } catch (error) {
    // File doesn't exist yet, that's okay
  }

  // Create or update the file
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        branch: BRANCH,
        sha: sha || undefined,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub commit failed: ${error.message}`);
  }

  return await response.json();
}

export function isGitHubConfigured(): boolean {
  return !!(GITHUB_TOKEN && GITHUB_REPO);
}
