import { FinisherClient } from './finisher-client';

interface Params {
  params: Promise<{ gameId: string }>;
}

export default async function FinisherPage({ params }: Params) {
  const { gameId } = await params;
  return <FinisherClient gameId={gameId} />;
}
