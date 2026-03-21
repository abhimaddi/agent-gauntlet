import { ReplayClient } from './replay-client';

interface Params {
  params: Promise<{ gameId: string }>;
}

export default async function ReplayPage({ params }: Params) {
  const { gameId } = await params;
  return <ReplayClient gameId={gameId} />;
}
