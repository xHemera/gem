/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly EDIT_PASSWORD_HASH: string;
  readonly GITHUB_TOKEN: string;
  readonly GITHUB_REPO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
