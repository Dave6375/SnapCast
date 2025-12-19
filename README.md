This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Pushing to GitHub

To push this project (or any other project) to a new GitHub repository, follow these steps:

### Option 1: Using GitHub CLI (Recommended)

1. Make sure you have [GitHub CLI](https://cli.github.com/) installed
2. Navigate to your project directory
3. Initialize git (if not already done):
   ```bash
   git init
   ```
4. Add all files to staging:
   ```bash
   git add .
   ```
5. Create your initial commit:
   ```bash
   git commit -m "Initial commit: SnapCast project"
   ```
6. Create the GitHub repository and push in one command:
   ```bash
   gh repo create SnapCast --public --source=. --remote=origin --push
   ```
   
   To create a private repository instead, use `--private` instead of `--public`.

### Option 2: Manual Method

1. Create a new repository on [GitHub.com](https://github.com/new)
2. Initialize git locally (if not already done):
   ```bash
   git init
   ```
3. Add all files:
   ```bash
   git add .
   ```
4. Create your initial commit:
   ```bash
   git commit -m "Initial commit"
   ```
5. Add the remote repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
6. Push your code:
   ```bash
   git push -u origin master
   ```

### Subsequent Updates

After your initial push, to update your GitHub repository with new changes:

```bash
git add .
git commit -m "Describe your changes here"
git push
```
