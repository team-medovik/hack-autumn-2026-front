import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { snapshotsApi, type SnapshotRecord } from '@/entities/snapshot';
import { saveFile } from '@/shared/lib/download';
import { Button } from '@/shared/ui/button';

interface DownloadSnapshotButtonProps {
  snapshot: Pick<SnapshotRecord, 'id' | 'fileName'>;
}

/** «Скачать JSON»: файл текущего снимка под тем именем, с которым его загрузили. */
export const DownloadSnapshotButton = ({ snapshot }: DownloadSnapshotButtonProps) => {
  const { mutate, isPending } = useMutation({
    mutationFn: () => snapshotsApi.download(snapshot.id),
    onSuccess: (blob) => saveFile(blob, snapshot.fileName),
    onError: () =>
      toast.error('Не удалось скачать снимок', {
        description: 'Сервер не ответил. Попробуйте ещё раз',
      }),
  });

  return (
    <Button variant="secondary" active loading={isPending} onClick={() => mutate()}>
      Скачать JSON
    </Button>
  );
};
