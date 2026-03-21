import { ArenaClient } from './arena-client';

interface Params {
  params: Promise<{ gameId: string }>;
}

export default async function ArenaPage({ params }: Params) {
  const { gameId } = await params;
  return <ArenaClient gameId={gameId} />;
}
