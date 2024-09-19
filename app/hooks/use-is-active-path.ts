import { useResolvedPath, useNavigation, useLocation, matchPath } from "@remix-run/react";

export function useIsActivePath(to: string) {
    const { pathname } = useResolvedPath(to);
    const navigation = useNavigation();
    const currentLocation = useLocation();
    const location =
      navigation.location && !navigation.formData
        ? navigation.location
        : currentLocation;
    const match = matchPath(pathname + "/*", location.pathname);
    return Boolean(match);
  }