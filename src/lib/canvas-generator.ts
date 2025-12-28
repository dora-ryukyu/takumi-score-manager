import { getRateColorClass } from "./colors";

export interface BestImageScore {
  title: string;
  difficulty: string;
  score: number;
  rank: string;
  constVal: number;
  rating: string;
  contrib: number;
}

export interface BestImageProfile {
  name: string;
  rate: string;
  date: string;
  userImageUrl?: string;
}

/**
 * Modern Light Mode Canvas Generator (3:4 Portrait)
 */
export async function generateBestImage(scores: BestImageScore[], profile: BestImageProfile): Promise<string> {
  const width = 1200; 
  const height = 1600; 
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  // --- 1. Background Layer ---
  ctx.fillStyle = "#f8fafc"; 
  ctx.fillRect(0, 0, width, height);
  
  const drawBlob = (x: number, y: number, color: string, radius: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
  };
  
  drawBlob(width, 0, "rgba(59, 130, 246, 0.08)", 900);
  drawBlob(0, height, "rgba(168, 85, 247, 0.08)", 900);

  ctx.fillStyle = "rgba(100, 116, 139, 0.08)"; 
  const dotSpacing = 40;
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- 2. Header ---
  const glassMargin = 30; 
  const headerHeight = 200; 
  const headerBoxY = glassMargin;
  const headerBoxH = headerHeight - glassMargin; // 170
  const headerCenterY = headerBoxY + headerBoxH / 2;

  ctx.save();
  
  // Header Card
  ctx.shadowColor = "rgba(148, 163, 184, 0.2)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  roundedRect(ctx, headerBoxY, headerBoxY, width - headerBoxY * 2, headerBoxH, 24);
  ctx.fill();
  
  // Border
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // --- User Icon ---
  const iconSize = 120;
  const iconX = glassMargin + 40;
  const iconY = headerCenterY - iconSize / 2;
  
  // Ring
  ctx.strokeStyle = "#e2e8f0"; 
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2 + 4, 0, Math.PI*2);
  ctx.stroke();

  // Image
  ctx.save();
  roundedRect(ctx, iconX, iconY, iconSize, iconSize, iconSize/2); 
  ctx.clip();
  ctx.fillStyle = "#cbd5e1"; 
  ctx.fill();

  if (profile.userImageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous"; 
      img.src = profile.userImageUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; 
      });
      ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
    } catch (e) { console.warn("Avatar load failed", e); }
  }
  ctx.restore();

  // --- Header Text Content ---
  const infoX = iconX + iconSize + 30; 
  
  // Available width logic
  const rightStatsWidth = 180; // Reduced for narrower graph
  const maxNameWidth = width - infoX - rightStatsWidth - glassMargin - 20;

  ctx.textBaseline = "middle"; 
  
  // 1. Player Name
  ctx.fillStyle = "#1e293b"; 
  ctx.textAlign = "left";
  
  const mainFontSize = 56;
  
  let nameFontSize = mainFontSize;
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  while (ctx.measureText(profile.name).width > maxNameWidth && nameFontSize > 24) {
    nameFontSize -= 2;
    ctx.font = `bold ${nameFontSize}px sans-serif`;
  }
  ctx.fillText(profile.name, infoX, headerCenterY);
  const nameActualWidth = ctx.measureText(profile.name).width;

  // 2. Rating Group (Aligned to Name, Same Line)
  const rateGroupX = infoX + nameActualWidth + 30;
  const rateNum = parseFloat(profile.rate);
  
  // Determine Rate Color / Gradient shared for Label and Number
  let rateFillStyle: string | CanvasGradient = "#0284c7"; // Default Cyan

  if (rateNum >= 19.0) {
     const gradient = ctx.createLinearGradient(rateGroupX, 0, rateGroupX + 250, 0); // Wide coverage
     gradient.addColorStop(0, "#eab308"); // yellow
     gradient.addColorStop(0.5, "#d946ef"); // magenta
     gradient.addColorStop(1, "#0ea5e9"); // cyan
     rateFillStyle = gradient;
  } else if (rateNum >= 18.0) {
     rateFillStyle = "#ca8a04"; 
  }

  // "RATING" Label
  ctx.fillStyle = rateFillStyle; 
  ctx.font = "bold 20px sans-serif"; 
  ctx.fillText("RATING", rateGroupX, headerCenterY); 
  const labelWidth = ctx.measureText("RATING").width;

  // Rating Value
  const valueX = rateGroupX + labelWidth + 15;
  ctx.font = `bold ${mainFontSize}px sans-serif`; 
  ctx.fillStyle = rateFillStyle;
  ctx.fillText(profile.rate, valueX, headerCenterY);

  // Date Tag
  const dateText = profile.date.replace(/\//g, '.');
  ctx.fillStyle = "#cbd5e1"; 
  ctx.font = "13px monospace";
  ctx.textAlign = "right";
  ctx.fillText(dateText, width - glassMargin - 30, glassMargin + 30);

  // --- Graph Area (Far Right, Narrower) ---
  const graphWidth = 150; // Halved from 300
  const graphRightX = width - glassMargin - 40;
  const graphX = graphRightX - graphWidth;
  const graphH = 50;
  const graphY = headerCenterY - graphH / 2;

  // Graph Container
  ctx.fillStyle = "#f1f5f9"; 
  roundedRect(ctx, graphX - 10, graphY - 15, graphWidth + 20, graphH + 25, 12);
  ctx.fill();

  if (scores.length > 0) {
    ctx.save();
    const maxVal = Math.max(...scores.map(s => s.contrib)) * 1.05;
    const minVal = Math.min(...scores.map(s => s.contrib)) * 0.95;
    
    ctx.beginPath();
    scores.slice(0, 40).forEach((s, i) => {
       const px = graphX + (i / 39) * (graphWidth);
       const py = graphY + graphH - ((s.contrib - minVal) / (maxVal - minVal)) * graphH;
       if (i === 0) ctx.moveTo(px, py);
       else ctx.lineTo(px, py);
    });
    
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#3b82f6"; 
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(graphX + graphWidth, graphY + graphH);
    ctx.lineTo(graphX, graphY + graphH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, graphY, 0, graphY + graphH);
    grad.addColorStop(0, "rgba(59, 130, 246, 0.2)");
    grad.addColorStop(1, "rgba(59, 130, 246, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("ANALYTICS", graphX, graphY - 8);

    ctx.restore();
  }

  ctx.restore(); // End Header Scope

  // --- 3. Score List ---
  const contentStartY = 230; 
  const colGap = 20;
  const colWidth = (width - (glassMargin * 2) - colGap) / 2; 
  const rowHeight = 59; 
  const rowGap = 7; 

  const drawScoreCard = (score: BestImageScore, index: number, x: number, y: number) => {
    // Weighted Progress Bar
    const scoreVal = score.score;
    let progressRatio = Math.max(0, Math.min((scoreVal - 800000) / 200000, 1.0));
    progressRatio = Math.pow(progressRatio, 4);
    const progressWidth = colWidth * progressRatio;

    ctx.save();
    
    // Background
    ctx.shadowColor = "rgba(148, 163, 184, 0.1)"; 
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "white"; 
    roundedRect(ctx, x, y, colWidth, rowHeight, 8);
    ctx.fill();
    ctx.shadowBlur = 0; 

    // Progress Bar
    ctx.save();
    roundedRect(ctx, x, y, colWidth, rowHeight, 8);
    ctx.clip();
    const progGrad = ctx.createLinearGradient(x, y, x + progressWidth, y);
    progGrad.addColorStop(0, "rgba(224, 242, 254, 0.3)"); 
    progGrad.addColorStop(1, "rgba(186, 230, 253, 0.8)"); 
    ctx.fillStyle = progGrad;
    ctx.fillRect(x, y, progressWidth, rowHeight);
    ctx.restore();

    // --- Content ---
    const centerY = y + rowHeight / 2;
    ctx.textBaseline = "middle";

    // 1. Rank (Far Left)
    ctx.fillStyle = "#94a3b8"; 
    ctx.font = "bold 16px monospace"; // Larger
    ctx.textAlign = "center";
    ctx.fillText(`${index + 1}`, x + 25, centerY);
    
    // 2. Difficulty (Bar + Text)
    const diffColor = getDiffColor(score.difficulty);
    const diffAbbr = getDiffAbbr(score.difficulty);
    
    ctx.fillStyle = diffColor;
    const barH = 28; // Taller bar
    roundedRect(ctx, x + 48, centerY - barH/2, 5, barH, 2.5); // Thicker bar
    ctx.fill();
    
    ctx.fillStyle = diffColor;
    ctx.font = "bold 16px sans-serif"; // Larger
    ctx.textAlign = "left";
    ctx.fillText({
      "NOR": "N", "HRD": "H", "MAS": "M", "INS": "I", "RVG": "R", "UNK": "?"
    }[diffAbbr] || diffAbbr, x + 62, centerY + 1);

    // 3. Right Side Stats
    const cardPadding = 15;
    const rightEdge = x + colWidth - cardPadding;
    
    // Rate (Far Right)
    ctx.textAlign = "right";
    ctx.fillStyle = "#0284c7"; 
    ctx.font = "bold 26px monospace"; // Even Larger
    const rateText = score.rating;
    ctx.fillText(rateText, rightEdge, centerY); 
    const rateWidth = ctx.measureText(rateText).width;
    
    // Const & Score
    const statsColor = "#475569"; 
    const statsX = rightEdge - rateWidth - 25;
    ctx.textAlign = "right";
    ctx.fillStyle = statsColor;

    // Const (Top)
    ctx.font = "bold 14px monospace"; // Larger
    ctx.fillText(`${score.constVal.toFixed(1)}`, statsX, centerY - 10);
    
    // Score (Bottom)
    ctx.font = "15px monospace"; // Larger
    ctx.fillText(score.score.toLocaleString(), statsX, centerY + 10);
    
    // 4. Title (Fills remaining space)
    const titleStartX = x + 90; // Shifted right due to larger diff
    const titleEndX = statsX - 25; 
    const maxTitleW = titleEndX - titleStartX;
    
    ctx.fillStyle = "#1e293b"; 
    ctx.font = "bold 22px sans-serif"; // Significantly Larger Title
    ctx.textAlign = "left";
    let title = score.title || "";
    title = truncateText(ctx, title, maxTitleW);
    ctx.fillText(title, titleStartX, centerY);

    ctx.restore(); 
  };
  
  // Render Loop
  scores.slice(0, 40).forEach((score, i) => {
    const colParams = i < 20 ? 0 : 1;
    const rowParams = i % 20;
    
    const x = glassMargin + (colParams * (colWidth + colGap));
    const y = contentStartY + (rowParams * (rowHeight + rowGap));
    
    drawScoreCard(score, i, x, y);
  });
  
  // --- Footer ---
  const footerH = 50;
  ctx.save();
  ctx.fillStyle = "#f1f5f9"; 
  ctx.fillRect(0, height - footerH, width, footerH);
  
  ctx.fillStyle = "#64748b"; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("GENERATED BY TAKUMI³ SCORE MANAGER", width/2, height - footerH/2);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/* --- Helpers --- */

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | {tl?:number, tr?:number, br?:number, bl?: number}) {
  ctx.beginPath();
  const r = typeof radius === 'number' ? {tl: radius, tr: radius, br: radius, bl: radius} : radius;
  // Defaults
  const tl = r.tl || 0; const tr = r.tr || 0; const br = r.br || 0; const bl = r.bl || 0;
  
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + width - tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
  ctx.lineTo(x + width, y + height - br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
  ctx.lineTo(x + bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncatedText = text;
  while (ctx.measureText(truncatedText + "...").width > maxWidth && truncatedText.length > 0) {
    truncatedText = truncatedText.slice(0, -1);
  }
  return truncatedText + "...";
}

function getDiffColor(diff: string): string {
  if (!diff) return "#94a3b8"; 
  const d = diff.toUpperCase();
  if (d.includes("NORMAL")) return "#2563eb"; 
  if (d.includes("HARD")) return "#d97706"; 
  if (d.includes("MASTER")) return "#c026d3"; 
  if (d.includes("INSANITY")) return "#475569"; 
  if (d.includes("RAVAGE")) return "#dc2626"; 
  return "#94a3b8";
}

function getDiffAbbr(diff: string): string {
  const d = diff ? diff.toUpperCase() : "";
  if (d.includes("NORMAL")) return "NOR";
  if (d.includes("HARD")) return "HRD";
  if (d.includes("MASTER")) return "MAS";
  if (d.includes("INSANITY")) return "INS";
  if (d.includes("RAVAGE")) return "RVG";
  return "UNK";
}

function getRankColor(rank: string): string {
   switch (rank) {
    case "S+": return "#d97706"; 
    case "S":  return "#eab308"; 
    case "aaa":
    case "AAA": return "#c026d3"; 
    default:   return "#94a3b8"; 
  }
}
