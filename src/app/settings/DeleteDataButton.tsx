'use client';

import { useState } from 'react';
import DeleteDataModal from '@/components/DeleteDataModal';

export default function DeleteDataButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        データを削除する
      </button>
      <DeleteDataModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
