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

export function calculateRating(score: number, chartConst: number): number {
  const contrib = calculateSongContrib(score, chartConst);
  return contrib * 40;
}
/**
 * 単曲レートから到達スコアを逆算する
 * calculateSongContribの逆関数
 * @param rate 単曲レート (例: 16.00)
 * @param chartConst 譜面定数 (Example: 14.0)
 * @returns 推定スコア (整数に丸めるのが一般的だが一旦実数で返すか、呼び出し元で丸める)
 */
export function calculateRequiredScore(displayRate: number, chartConst: number): number {
  if (displayRate <= 0) return 0;
  
  // displayRate = contrib * 40 => contrib = displayRate / 40
  // val = contrib * 34
  // val = (displayRate / 40) * 34 = displayRate * 0.85
  const val = displayRate * 0.85;

  // Case 6: 999,000+
  // val = const + 2 + (score - 999000)/10000
  // Threshold: const + 2
  if (val >= chartConst + 2) {
    return Math.round((val - chartConst - 2) * 10000 + 999000);
  }

  // Case 5: 995,000 ~ 999,000
  // val = const + 1.5 + (score - 995000)/8000
  // Threshold: const + 1.5
  if (val >= chartConst + 1.5) {
    return Math.round((val - chartConst - 1.5) * 8000 + 995000);
  }

  // Case 4: 990,000 ~ 995,000
  // val = const + 1 + (score - 990000)/10000
  // Threshold: const + 1
  if (val >= chartConst + 1) {
    return Math.round((val - chartConst - 1) * 10000 + 990000);
  }

  // Case 3: 970,000 ~ 990,000
  // val = const + (score - 970000)/20000
  // Threshold: const
  if (val >= chartConst) {
    return Math.round((val - chartConst) * 20000 + 970000);
  }

  // Case 2: 800,000 ~ 970,000
  // val = const * ((score - 800000) / 170000)
  // Threshold: > 0 (assuming const > 0)
  if (chartConst > 0 && val > 0) {
    // val / const = ratio
    // ratio = (score - 800000) / 170000
    const ratio = val / chartConst;
    return Math.round(ratio * 170000 + 800000);
  }

  return 0; // 80万未満相当
}