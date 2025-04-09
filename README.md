# Riddle chain 

This is a demo application built as a challenge. The goal was to implement the [smart contract](https://github.com/poppyseedDev/solidity-riddle/blob/main/contracts/OnchainRiddle.sol) and utilize it to store and read riddles.

## Project structure

This is project structured as a monorepo and created using [Turborepo](https://turbo.build/docs/getting-started/examples). The project contains 3 sub-repos which contain the following:

- `bot-llm`: Project connecting to an LLM and listening to a smart contract events
- `contracts`: Project responsible for deployment of smart contracts 
- `web`: A nextjs application containing the FrontEnd application that displays riddles. 

The default package manager is `pnpm`. Each project has their own `.env` file configurations, examples can be seen in `.env.example` in each directory. Further details about each project can be seen in their respective `README.md` files. 

The project is **work in-progress-ish and very likely to have unhandled bugs**. There is no Docker configuration currently setup. Present are files which do not function and must change in order for the process to work. Despite this *Docker is used to host and run a local Database* using [PostgresSQL](https://www.postgresql.org/) so is required.

The tested version of this repository works with **Node 22**. 
 
## Starting the project

There are two considered use cases - testing on a [Hardhat](https://hardhat.org/) node or using Sepolia network. Below are detailed instructions for both approaches.

### Using Hardhat
- In root folder execute `pnpm install`
- Navigate to `apps/contracts`
- Copy `.env.example` to a file `.env.local`. The env variables are the default keys coming with hardhat, they are publicly known.
- Navigate to `apps/contracts` and execute `npx hardhat node`. This starts a **local hardhat node** on address `http://127.0.0.1:8545/`. Should the ports be taken adjustments will need to be made.
- In a new terminal again from apps/contracts execute pnpm deploy-riddle —network localhost - this deploys the contracts and sets an initial riddle. Expect to see `First riddle set successfully!` as last line of logs. 
- From the root directory execute `docker-compose up`. Feel free to use `docker-compsoe up -d` to start in detached mode. This prepares the postgres container to be used as database for the web application.
- Navigate to `apps/web` and copy `.env.example` to `.env.local`. You can use it as is since we keep the env variables the same for the local node. 
- Execute `pnpm init-prisma` in context of `apps/web` - your database should now be set.
- Navigate to `apps/bot-llm` and copy the `.env.example` file. **You need to enter your own OpenAI key**, the other values can be kept the same, `INFURA_API_KEY` is not required for hardhat test.
- In the root folder execute `pnpm dev`. You should be able to open the application on http://localhost:3000/ and test it.
- **BEFORE TESTING LOCALLY** Locally make sure you have [metamask](https://metamask.io/) installed on your browser. You need to also add a custom network and change to it in order for you to see riddles from your local network. You can find support on adding a custom network on this [link](https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc/). As a guideline you can set
```
Network name - localhost
Default RPC URL - http://127.0.0.1:8545/
ChainID - 1337
Currency symbol - ETH
Block expror URL - http://127.0.0.1:8545/
```	
 	
- After all these steps the application can be tested and should work.

### Using Sepolia
- In root folder execute `pnpm install`
- Navigate to `apps/contracts`
- You will need to set the keys defined in `.env.example` in a `.env.local` file. You need to enter your account


Boilerplate from here below -> TODO clear

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest -e with-tailwind
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `web`: another [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `ui`: a stub React component library with [Tailwind CSS](https://tailwindcss.com/) shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Building packages/ui

This example is set up to produce compiled styles for `ui` components into the `dist` directory. The component `.tsx` files are consumed by the Next.js apps directly using `transpilePackages` in `next.config.ts`. This was chosen for several reasons:

- Make sharing one `tailwind.config.ts` to apps and packages as easy as possible.
- Make package compilation simple by only depending on the Next.js Compiler and `tailwindcss`.
- Ensure Tailwind classes do not overwrite each other. The `ui` package uses a `ui-` prefix for it's classes.
- Maintain clear package export boundaries.

Another option is to consume `packages/ui` directly from source without building. If using this option, you will need to update the `tailwind.config.ts` in your apps to be aware of your package locations, so it can find all usages of the `tailwindcss` class names for CSS compilation.

For example, in [tailwind.config.ts](packages/tailwind-config/tailwind.config.ts):

```js
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/ui/*.{js,ts,jsx,tsx}",
  ],
```

If you choose this strategy, you can remove the `tailwindcss` and `autoprefixer` dependencies from the `ui` package.

### Utilities

This Turborepo has some additional tools already setup for you:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
