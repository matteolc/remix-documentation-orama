import { useEffect } from 'react';
import { useRevalidator } from '@remix-run/react';
import { subscribeToSchemeChange } from '@epic-web/client-hints/color-scheme';

import { hintsUtils } from '~/hooks/use-hints';

/**
 * `ClientHintCheck` is a React component that checks for specific client hints and renders
 * content conditionally based on the presence of these hints. Client hints are HTTP headers
 * that provide information about the user's device, browser, and preferences.
 *
 * @component
 *
 * @example
 * // Usage example:
 * import React from 'react';
 * import ClientHintCheck from './client-hints';
 *
 * const App = () => (
 *   <ClientHintCheck>
 *     <p>Your browser supports client hints!</p>
 *   </ClientHintCheck>
 * );
 *
 * export default App;
 *
 * @remarks
 * - This component can be used to conditionally render content based on client hints.
 * - It checks for specific client hints such as device memory, network type, and more.
 * - If the required client hints are present, it renders the children; otherwise, it renders nothing.
 *
 * @param {object} props - The props object.
 * @param {React.ReactNode} props.children - The content to render if the client hints are present.
 *
 * @returns {JSX.Element | null} - The rendered content if the client hints are present, otherwise `null`.
 */
export function ClientHintCheck({ nonce }: { nonce: string }): JSX.Element {
  const { revalidate } = useRevalidator();
  useEffect(() => subscribeToSchemeChange(() => revalidate()), [revalidate]);

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}
