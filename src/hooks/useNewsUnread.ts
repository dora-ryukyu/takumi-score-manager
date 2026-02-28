"use client";

import { useState, useEffect } from "react";
import { NEWS_DATA } from "@/data/news-data";

const STORAGE_KEY = "news_last_read_id";

/**
 * お知らせの未読管理フック
 * - 最新のお知らせIDをlocalStorageに保存
 * - 未読かどうか（= 最新IDが保存済みIDと異なる）を返す
 */
export function useNewsUnread() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const lastReadId = localStorage.getItem(STORAGE_KEY);
    
    if (NEWS_DATA.length === 0) {
      setUnreadCount(0);
      return;
    }

    // 未読 = 未だ見ていないお知らせの数
    if (!lastReadId) {
      // 一度も見ていない場合は全件未読
      setUnreadCount(NEWS_DATA.length);
      return;
    }

    const lastReadIndex = NEWS_DATA.findIndex((item) => item.id === lastReadId);
    if (lastReadIndex === -1) {
      // 保存されたIDが見つからなければ全件未読
      setUnreadCount(NEWS_DATA.length);
    } else {
      // lastReadIndex より前（配列先頭側 = 新しい順）のものが未読
      setUnreadCount(lastReadIndex);
    }
  }, []);

  const markAllRead = () => {
    if (NEWS_DATA.length > 0) {
      localStorage.setItem(STORAGE_KEY, NEWS_DATA[0].id);
      setUnreadCount(0);
    }
  };

  return { unreadCount, markAllRead };
}
