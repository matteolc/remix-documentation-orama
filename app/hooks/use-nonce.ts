/**
 * Nonce Provider.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce
 */
import { createContext, useContext } from 'react';

const NonceContext = createContext<string>('');
const NonceProvider = NonceContext.Provider;

const useNonce = () => useContext(NonceContext);

export { NonceProvider, useNonce, NonceContext };
