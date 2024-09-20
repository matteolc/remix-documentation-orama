import { loader, default as DocsPage } from "~/routes/_docs+/docs.$lang.$ref.$";

function SplatPage() {
  return <DocsPage />;
}

export default SplatPage;
export { loader };
