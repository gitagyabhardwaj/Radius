/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as batches from "../batches.js";
import type * as campaigns from "../campaigns.js";
import type * as escrow from "../escrow.js";
import type * as helpers from "../helpers.js";
import type * as instagram from "../instagram.js";
import type * as matching from "../matching.js";
import type * as offers from "../offers.js";
import type * as payments from "../payments.js";
import type * as ratings from "../ratings.js";
import type * as seed from "../seed.js";
import type * as submissions from "../submissions.js";
import type * as test_mutations from "../test_mutations.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  batches: typeof batches;
  campaigns: typeof campaigns;
  escrow: typeof escrow;
  helpers: typeof helpers;
  instagram: typeof instagram;
  matching: typeof matching;
  offers: typeof offers;
  payments: typeof payments;
  ratings: typeof ratings;
  seed: typeof seed;
  submissions: typeof submissions;
  test_mutations: typeof test_mutations;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
