import { fetchItem, fetchItemCollections } from "@/lib/zotero/client";
import { transformItem, prepareForDetail } from "@/lib/zotero/transform";
import ResourceDetail from "@/components/Resources/ResourceDetail";

export default async function ResourceDetailPage({ params }) {
  const { id } = await params;

  let resource = null;
  let error = null;

  try {
    const rawItem = await fetchItem(id);
    const collections = await fetchItemCollections(id);

    // Get all collection names that this item belongs to
    const collectionNames = collections.map((c) => c.name);

    // Transform with collection info
    const transformedItem = transformItem(rawItem, {
      collectionName: collectionNames.length > 0 ? collectionNames : undefined,
    });

    resource = prepareForDetail(transformedItem);
  } catch (err) {
    error = err;
  }

  if (error || !resource) {
    return (
      <div
        className="p-12 text-center"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        <h1>Resource not found</h1>
      </div>
    );
  }

  return <ResourceDetail resource={resource} />;
}
