// Type definitions for Next.js routes

/**
 * Internal types used by the Next.js router and Link component.
 * These types are not meant to be used directly.
 * @internal
 */
declare namespace __next_route_internal_types__ {
  type SearchOrHash = `?${string}` | `#${string}`
  type WithProtocol = `${string}:${string}`

  type Suffix = '' | SearchOrHash

  type SafeSlug<S extends string> = S extends `${string}/${string}`
    ? never
    : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type CatchAllSlug<S extends string> = S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type OptionalCatchAllSlug<S extends string> =
    S extends `${string}${SearchOrHash}` ? never : S

  type StaticRoutes = 
    | `/`
    | `/ai-copilot`
    | `/api/ai/alliances`
    | `/api/ai/bookmark-summary`
    | `/api/ai/copilot-core`
    | `/api/ai/forecasting`
    | `/api/ai/bookmark-finder`
    | `/api/ai/learning-path-generator`
    | `/api/ai/real-time-refresher`
    | `/api/ai/predictive-engine`
    | `/api/apply-migration`
    | `/api/bookmark-relationships`
    | `/api/bookmarks`
    | `/api/bookmarks/reorder`
    | `/api/bookmarks/metadata`
    | `/api/bookmarks/validate`
    | `/api/bookmarks/search`
    | `/api/bookmarks/visit`
    | `/api/debug-bookmark`
    | `/api/debug-bookmarks`
    | `/api/debug-profile`
    | `/api/debug-tags`
    | `/api/debug-relationships`
    | `/api/dna-profile`
    | `/api/dna-profile/insights`
    | `/api/dna-profile/stats`
    | `/api/dna-profile/recommendations`
    | `/api/fix-user-ids`
    | `/api/folders`
    | `/api/maintenance/fix-tags`
    | `/api/health`
    | `/api/migrate`
    | `/api/playlists`
    | `/api/preferences`
    | `/api/profile`
    | `/api/sentry-example-api`
    | `/api/setup-database`
    | `/api/setup-relations`
    | `/api/stagewise-check`
    | `/api/stagewise-mock-server`
    | `/api/supabase/execute`
    | `/api/tags`
    | `/api/test-auth`
    | `/api/test-browser-auth`
    | `/api/test-data`
    | `/api/test-supabase`
    | `/api/test-tag-creation`
    | `/api/time-capsules`
    | `/api/time-capsules/stats`
    | `/api/time-tracking/external-visit`
    | `/api/time-tracking/stats`
    | `/api/time-tracking/session`
    | `/api/upload`
    | `/analytics`
    | `/dashboard`
    | `/favorites`
    | `/feature`
    | `/features`
    | `/features/ai-filter`
    | `/features/analytics`
    | `/features/integrations`
    | `/features/multilingual`
    | `/features/settings`
    | `/features/marketplace`
    | `/features/tab-saver`
    | `/features/social`
    | `/landing`
    | `/landing-copy`
    | `/marketplace`
    | `/notifications-test`
    | `/dna-profile`
    | `/playlists`
    | `/related-test`
    | `/search`
    | `/sentry-example-page`
    | `/pricing`
    | `/settings`
    | `/stagewise-debug`
    | `/test-auto-tracking`
    | `/simple-tags`
    | `/test-stagewise`
    | `/test-time-tracking`
    | `/test-upload`
    | `/time-capsule`
    | `/timer`
  type DynamicRoutes<T extends string = string> = 
    | `/api/bookmarks/${SafeSlug<T>}`
    | `/api/bookmarks/${SafeSlug<T>}/related`
    | `/api/bookmarks/${SafeSlug<T>}/tags`
    | `/api/playlists/${SafeSlug<T>}`
    | `/api/playlists/${SafeSlug<T>}/duplicate`
    | `/api/playlists/${SafeSlug<T>}/launch`
    | `/api/time-capsules/${SafeSlug<T>}`
    | `/api/time-capsules/${SafeSlug<T>}/restore`
    | `/bookmarks/${SafeSlug<T>}`
    | `/category/${SafeSlug<T>}`
    | `/sign-up/${OptionalCatchAllSlug<T>}`
    | `/sign-in/${OptionalCatchAllSlug<T>}`

  type RouteImpl<T> = 
    | StaticRoutes
    | SearchOrHash
    | WithProtocol
    | `${StaticRoutes}${SearchOrHash}`
    | (T extends `${DynamicRoutes<infer _>}${Suffix}` ? T : never)
    
}

declare module 'next' {
  export { default } from 'next/types.js'
  export * from 'next/types.js'

  export type Route<T extends string = string> =
    __next_route_internal_types__.RouteImpl<T>
}

declare module 'next/link' {
  import type { LinkProps as OriginalLinkProps } from 'next/dist/client/link.js'
  import type { AnchorHTMLAttributes, DetailedHTMLProps } from 'react'
  import type { UrlObject } from 'url'

  type LinkRestProps = Omit<
    Omit<
      DetailedHTMLProps<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >,
      keyof OriginalLinkProps
    > &
      OriginalLinkProps,
    'href'
  >

  export type LinkProps<RouteInferType> = LinkRestProps & {
    /**
     * The path or URL to navigate to. This is the only required prop. It can also be an object.
     * @see https://nextjs.org/docs/api-reference/next/link
     */
    href: __next_route_internal_types__.RouteImpl<RouteInferType> | UrlObject
  }

  export default function Link<RouteType>(props: LinkProps<RouteType>): JSX.Element
}

declare module 'next/navigation' {
  export * from 'next/dist/client/components/navigation.js'

  import type { NavigateOptions, AppRouterInstance as OriginalAppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime.js'
  interface AppRouterInstance extends OriginalAppRouterInstance {
    /**
     * Navigate to the provided href.
     * Pushes a new history entry.
     */
    push<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Navigate to the provided href.
     * Replaces the current history entry.
     */
    replace<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Prefetch the provided href.
     */
    prefetch<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>): void
  }

  export function useRouter(): AppRouterInstance;
}

declare module 'next/form' {
  import type { FormProps as OriginalFormProps } from 'next/dist/client/form.js'

  type FormRestProps = Omit<OriginalFormProps, 'action'>

  export type FormProps<RouteInferType> = {
    /**
     * `action` can be either a `string` or a function.
     * - If `action` is a string, it will be interpreted as a path or URL to navigate to when the form is submitted.
     *   The path will be prefetched when the form becomes visible.
     * - If `action` is a function, it will be called when the form is submitted. See the [React docs](https://react.dev/reference/react-dom/components/form#props) for more.
     */
    action: __next_route_internal_types__.RouteImpl<RouteInferType> | ((formData: FormData) => void)
  } & FormRestProps

  export default function Form<RouteType>(props: FormProps<RouteType>): JSX.Element
}
