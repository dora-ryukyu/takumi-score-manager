/**
 * お問い合わせ先情報
 * 
 * 連絡先情報を一元管理するファイルです。
 * 複数のページで使用されるため、変更時はここを編集してください。
 */

export const CONTACT_INFO = {
  discord: {
    userId: "1207616500928610315",
    // Discordの招待リンクまたはユーザーページへのリンク
    // discord.com/users/ + userId でプロフィールページにアクセス可能
    profileUrl: "https://discord.com/users/1207616500928610315",
    displayText: "Discord でお問い合わせ",
  },
  x: {
    handle: "@Onekibright",
    profileUrl: "https://x.com/Onekibright",
    displayText: "X でお問い合わせ",
  },
  // 将来的にGoogle Formを追加する場合はここに設定
  googleForm: null as string | null,
  // googleForm: "https://forms.gle/xxxxxxx",
};

/**
 * お問い合わせ先の表示用テキストを生成
 */
export function getContactText(): string {
  const parts: string[] = [];
  
  if (CONTACT_INFO.discord) {
    parts.push(`Discord: ${CONTACT_INFO.discord.profileUrl}`);
  }

  if (CONTACT_INFO.x) {
    parts.push(`X: ${CONTACT_INFO.x.profileUrl}`);
  }
  
  if (CONTACT_INFO.googleForm) {
    parts.push(`お問い合わせフォーム: ${CONTACT_INFO.googleForm}`);
  }
  
  return parts.join("\n");
}
