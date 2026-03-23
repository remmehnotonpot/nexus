import Tracking from "@/views/Tracking";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Tracking initialTrackingId={id} />;
}
