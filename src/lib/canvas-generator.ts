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
 * Game UI Canvas Generator (Dark Tech/Cyber Style)
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
  // Base background: #0E1F34
  ctx.fillStyle = "#0E1F34"; 
  ctx.fillRect(0, 0, width, height);

  // Optional: Subtle grid or tech accent for "Game UI" feel
  ctx.strokeStyle = "rgba(0, 223, 235, 0.1)"; // Cyan dim
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // --- 2. Header ---
  const glassMargin = 30; 
  const headerHeight = 200; 
  const headerBoxY = glassMargin;
  const headerBoxH = headerHeight - glassMargin; // 170
  const headerCenterY = headerBoxY + headerBoxH / 2;

  ctx.save();
  
  // Header Frame Logic
  // Frame Color: #00DFEB
  // Fill Color: #1682A2
  
  ctx.fillStyle = "#1682A2";
  ctx.strokeStyle = "#00DFEB";
  ctx.lineWidth = 3;
  
  // Create shape path
  chamferedRect(ctx, headerBoxY, headerBoxY, width - headerBoxY * 2, headerBoxH, 20);
  ctx.fill();
  ctx.stroke();

  // --- User Icon ---
  const iconSize = 120;
  const iconX = glassMargin + 40;
  const iconY = headerCenterY - iconSize / 2;
  
  // Icon Border (Chamfered)
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00DFEB";
  chamferedRect(ctx, iconX - 4, iconY - 4, iconSize + 8, iconSize + 8, 12);
  ctx.stroke();
  
  // Icon Clip & Draw
  chamferedRect(ctx, iconX, iconY, iconSize, iconSize, 8); 
  ctx.clip();
  ctx.fillStyle = "#22363B"; 
  ctx.fillRect(iconX, iconY, iconSize, iconSize);

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
  
  const rightStatsWidth = 180;
  const maxNameWidth = width - infoX - rightStatsWidth - glassMargin - 20;

  ctx.textBaseline = "middle"; 
  
  // Helper for outlined text
  const drawOutlinedText = (text: string, x: number, y: number, fontSize: number, align: CanvasTextAlign = "left") => {
    ctx.font = `${fontSize}px sans-serif`; // Regular weight
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    
    // Stroke (Black outline)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3; 
    ctx.strokeText(text, x, y);
    
    // Fill (White)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text, x, y);
  };

  // 1. Player Name
  let nameFontSize = 56;
  ctx.font = `${nameFontSize}px sans-serif`;
  while (ctx.measureText(profile.name).width > maxNameWidth && nameFontSize > 24) {
    nameFontSize -= 2;
    ctx.font = `${nameFontSize}px sans-serif`;
  }
  drawOutlinedText(profile.name, infoX, headerCenterY, nameFontSize, "left");
  const nameActualWidth = ctx.measureText(profile.name).width;

  // 2. Rating Group
  const rateGroupX = infoX + nameActualWidth + 30;
  
  // "RATING" Label
  drawOutlinedText("RATING", rateGroupX, headerCenterY, 24, "left");
  const labelWidth = ctx.measureText("RATING").width;

  // Rating Value (Dynamically Colored)
  const rateNum = parseFloat(profile.rate);
  const valueX = rateGroupX + labelWidth + 15;
  const rateFontSize = 56;
  
  // Color Logic
  let rateColor = "#00DFEB"; // Default Cyan
  if (rateNum >= 19.0) rateColor = "#FFD700"; // Gold
  else if (rateNum >= 18.0) rateColor = "#C0C0C0"; // Silverish/White
  else if (rateNum >= 17.0) rateColor = "#CD7F32"; // Bronze
  else if (rateNum >= 16.0) rateColor = "#ff7777"; // Reddish

  ctx.font = `${rateFontSize}px sans-serif`;
  ctx.textAlign = "left";
  ctx.lineJoin = "round";
  
  // Stroke
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeText(profile.rate, valueX, headerCenterY);
  
  // Fill
  ctx.fillStyle = rateColor;
  ctx.fillText(profile.rate, valueX, headerCenterY);

  // Date Tag (Upper Right of Header)
  // Subtle text
  const dateText = profile.date.replace(/\//g, '.');
  ctx.font = "14px monospace";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(dateText, width - glassMargin - 20, headerBoxY + 20);

  // --- Graph Area (Far Right) ---
  const graphWidth = 140;
  const graphRightX = width - glassMargin - 30;
  const graphX = graphRightX - graphWidth;
  const graphH = 50;
  const graphY = headerCenterY - graphH / 2 + 10;

  // Graph bg
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  chamferedRect(ctx, graphX - 5, graphY - 5, graphWidth + 10, graphH + 10, 8);
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
    
    ctx.strokeStyle = "#00DFEB"; 
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00DFEB";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ANALYTICS", graphX, graphY - 10);
    ctx.restore();
  }

  ctx.restore(); // End Header

  // --- 3. Score List ---
  const contentStartY = 230; 
  const colGap = 20;
  const colWidth = (width - (glassMargin * 2) - colGap) / 2; 
  const rowHeight = 60; 
  const rowGap = 8; 

  const drawScoreCard = (score: BestImageScore, index: number, x: number, y: number) => {
    // Fill: #22363B
    // Border: #00DFEB (maybe thinner)
    
    ctx.save();
    
    // Background Fill
    ctx.fillStyle = "#22363B"; 
    chamferedRect(ctx, x, y, colWidth, rowHeight, 10);
    ctx.fill();
    
    // Optional: Border for each card? Or just fill.
    // User said "Like header", implying border.
    ctx.strokeStyle = "#1682A2"; // Slightly dimmer than header border for contrast hierarchy
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Progress Bar (Background accent)
    const scoreVal = score.score;
    // Ratio for visual flair
    const progressRatio = Math.max(0, Math.min((scoreVal - 900000) / 100000, 1.0)); // simple range
    if (progressRatio > 0) {
        ctx.save();
        chamferedRect(ctx, x, y, colWidth, rowHeight, 10);
        ctx.clip();
        ctx.fillStyle = "rgba(0, 223, 235, 0.1)"; // Cyan faint
        ctx.fillRect(x, y, colWidth * progressRatio, rowHeight);
        ctx.restore();
    }

    // --- Content ---
    const centerY = y + rowHeight / 2;
    ctx.textBaseline = "middle";

    // 1. Rank
    ctx.fillStyle = "#00DFEB"; 
    ctx.font = "bold 16px monospace"; 
    ctx.textAlign = "center";
    ctx.fillText(`${index + 1}`, x + 25, centerY);
    
    // 2. Difficulty Tag
    const diffColor = getDiffColor(score.difficulty);
    const diffAbbr = getDiffAbbr(score.difficulty);
    
    ctx.fillStyle = diffColor;
    chamferedRect(ctx, x + 45, centerY - 12, 28, 24, 6);
    ctx.fill();
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText({
      "NOR": "N", "HRD": "H", "MAS": "M", "INS": "I", "RVG": "R", "UNK": "?"
    }[diffAbbr] || "?", x + 59, centerY + 1);

    // 3. Stats (Right side)
    const cardPadding = 15;
    const rightEdge = x + colWidth - cardPadding;
    
    // Rate
    ctx.textAlign = "right";
    ctx.fillStyle = "#FFFFFF"; // Clean white
    ctx.font = "bold 24px monospace";
    const rateText = score.rating;
    ctx.fillText(rateText, rightEdge, centerY); 
    const rateWidth = ctx.measureText(rateText).width;
    
    // Const & Score
    const statsColor = "#9CA3AF"; // Grayish cyan
    const statsX = rightEdge - rateWidth - 20;
    
    ctx.textAlign = "right";
    ctx.fillStyle = statsColor;

    // Const
    ctx.font = "bold 13px monospace";
    ctx.fillText(`${score.constVal.toFixed(1)}`, statsX, centerY - 10);
    
    // Score
    ctx.fillStyle = "#E5E7EB";
    ctx.font = "14px monospace";
    ctx.fillText(score.score.toLocaleString(), statsX, centerY + 10);
    
    // 4. Title
    const titleStartX = x + 85; 
    const titleEndX = statsX - 15; 
    const maxTitleW = titleEndX - titleStartX;
    
    ctx.fillStyle = "#FFFFFF"; 
    ctx.font = "20px sans-serif"; // Regular sans
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
  // Simple separator line
  ctx.beginPath();
  ctx.moveTo(glassMargin, height - footerH);
  ctx.lineTo(width - glassMargin, height - footerH);
  ctx.strokeStyle = "#1682A2";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.fillStyle = "#1682A2"; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "14px sans-serif";
  ctx.fillText("GENERATED BY TAKUMI³ SCORE MANAGER", width/2, height - footerH/2);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/* --- Helpers --- */

// Chamfered Rectangle (Octagonal-ish corners)
function chamferedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, chamfer: number) {
  ctx.beginPath();
  ctx.moveTo(x + chamfer, y);
  ctx.lineTo(x + w - chamfer, y);
  ctx.lineTo(x + w, y + chamfer);
  ctx.lineTo(x + w, y + h - chamfer);
  ctx.lineTo(x + w - chamfer, y + h);
  ctx.lineTo(x + chamfer, y + h);
  ctx.lineTo(x, y + h - chamfer);
  ctx.lineTo(x, y + chamfer);
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
  if (d.includes("NORMAL")) return "#3b82f6"; // Blue
  if (d.includes("HARD")) return "#f59e0b";   // Orange
  if (d.includes("MASTER")) return "#d946ef";  // Magenta
  if (d.includes("INSANITY")) return "#64748b"; // Dark/Gray
  if (d.includes("RAVAGE")) return "#ef4444";   // Red
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
