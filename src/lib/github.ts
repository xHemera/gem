import { Octokit } from '@octokit/rest';

function getClient(): Octokit {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

function getRepo(): { owner: string; repo: string } {
  const full = process.env.GITHUB_REPO ?? '';
  const [owner, repo] = full.split('/');
  return { owner, repo };
}

interface FileToCommit {
  path: string;
  content: string;
}

export async function commitFiles(
  files: FileToCommit[],
  message: string,
): Promise<void> {
  const octokit = getClient();
  const { owner, repo } = getRepo();

  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: 'heads/main',
  });

  const { data: baseTree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: ref.object.sha,
  });

  const treeItems = await Promise.all(
    files.map(async (file) => {
      const { data: blob } = await octokit.git.createBlob({
        owner,
        repo,
        content: file.content,
        encoding: 'base64',
      });
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      };
    }),
  );

  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTree.sha,
    tree: treeItems,
  });

  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [ref.object.sha],
  });

  await octokit.git.updateRef({
    owner,
    repo,
    ref: 'heads/main',
    sha: newCommit.sha,
  });
}

export function readFileContent(
  buffer: ArrayBuffer,
  encoding: 'base64' = 'base64',
): string {
  return Buffer.from(buffer).toString(encoding);
}
