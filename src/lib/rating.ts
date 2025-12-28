/**
 * 単曲レート（song_contrib）計算ロジック
 * 要件定義 7.2 に準拠
 * * @param score スコア (0〜1,000,000)
 * @param chartConst 譜面定数 (10.5, 14.0など)
 * @returns 単曲寄与値 (song_contrib)
 */
export function calculateSongContrib(score: number, chartConst: number): number {
  // 1. スコアが80万未満は0
  if (score < 800000) {
    return 0;
  }

  // 2. 80万以上 〜 97万未満
  // song_contrib = (const * ((score - 800000) / 170000)) / 34
  if (score < 970000) {
    const ratio = (score - 800000) / 170000;
    return (chartConst * ratio) / 34;
  }

  // 3. 97万以上
  // song_contrib = (const + bonus) / 34
  let bonus = 0;

  if (score < 990000) {
    // 97万 〜 99万未満
    bonus = (score - 970000) / 20000;
  } else if (score < 995000) {
    // 99万 〜 99.5万未満
    // bonus = 1 + (score - 990000) / 10000
    bonus = 1 + (score - 990000) / 10000;
  } else if (score < 999000) {
    // 99.5万 〜 99.9万未満
    // bonus = 1.5 + (score - 995000) / 8000
    bonus = 1.5 + (score - 995000) / 8000;
  } else {
    // 99.9万以上 (理論値含む)
    // bonus = 2 + (score - 999000) / 10000
    bonus = 2 + (score - 999000) / 10000;
    // ※要件にはないが、一般的に上限(理論値時)のキャップが必要ならここで調整
  }

  return (chartConst + bonus) / 34;
}

/**
 * 表示用単曲レート
 * song_rate_display = round(song_contrib * 40, 3)
 * ※小数点第3位まで残すか、四捨五入するか等は要件7.4に従う
 */
export function calculateDisplayRate(songContrib: number): string {
  // 小数点第3位まで表示（例: 12.345）
  // 実際には (val * 40) を計算
  const rawRate = songContrib * 40;
  return rawRate.toFixed(3); // 文字列として整形
}

/**
 * 総合レート計算
 * 要件 7.3: 上位40曲の song_contrib 合計
 * 表示: round(sum * 40, 3)
 */
export function calculateOverallRate(top40Contribs: number[]): string {
  const sum = top40Contribs.reduce((acc, cur) => acc + cur, 0);
  const rawOverall = sum * 40;
  return rawOverall.toFixed(3);
}