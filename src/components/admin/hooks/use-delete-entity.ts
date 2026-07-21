import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useDeleteEntity(
  deleteAction: (id: string, password: string) => Promise<{ error?: string }>,
  entityId: string,
  redirectPath: string,
) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteAction(entityId, deletePassword);
    if (result?.error) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }
    router.push(redirectPath);
  }

  return {
    showDeleteModal, setShowDeleteModal,
    deletePassword, setDeletePassword,
    deleteError, setDeleteError,
    deleting, handleDelete,
  };
}
