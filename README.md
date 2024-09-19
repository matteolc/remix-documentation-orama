# Documentation Website

## Contributing

If you want to make a contribution

- [Fork and clone](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repo
- Create a branch
- Push any changes you make to your branch
- Open up a PR in this Repo

## Setup

First setup your `.env` file, use `.env.example` to know what to set.

```sh
cp .env.example .env
```

Install dependencies

```sh
npm i
```

## Local Development

Now you should be good to go:

```sh
npm run dev
```

We leverage a number of LRUCache's to server-side cache various resources, such as processed markdown from GitHub, that expire at various times (usually after 5 minutes). If you want them to expire immediately for local development, set the `NO_CACHE` environment variable.

```sh
NO_CACHE=1 npm run dev
```

## Preview

## Deployment

The production server is always in sync with `main`

```sh
git push origin main
open https://your-documentation-website.com
```

## Content

## Orama Search

We use [Orama](https://oramasearch.com/) by Orama for our documentation's search. The site is automatically scraped and indexed weekly by Orama.

If the doc search results ever seem outdated or incorrect be sure to check that the crawler isn't blocked. If it is, it might just need to be canceled and restarted to kick things off again. There is also an editor in the Crawler admin that lets you adjust the crawler's script if needed.
