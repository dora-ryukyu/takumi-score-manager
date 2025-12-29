import { getRateColorClass, getDiffColor, getDiffAbbr } from "./colors";

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

export type ImageTheme = 'game' | 'light';

export async function generateBestImage(scores: BestImageScore[], profile: BestImageProfile, theme: ImageTheme = 'game'): Promise<string> {
  const width = 1200; 
  const height = 1600; 
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  if (theme === 'light') {
    await renderLightMode(ctx, width, height, scores, profile);
  } else {
    await renderGameMode(ctx, width, height, scores, profile);
  }

  return canvas.toDataURL("image/png");
}

/**
 * --- GAME MODE (Default) ---
 * Dark, Chamfered, Tech/Cyber Style
 */
async function renderGameMode(ctx: CanvasRenderingContext2D, width: number, height: number, scores: BestImageScore[], profile: BestImageProfile) {
  // --- 1. Background Layer ---
  ctx.fillStyle = "#0E1F34"; 
  ctx.fillRect(0, 0, width, height);

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
  
  // Header Frame
  ctx.fillStyle = "#1682A2";
  ctx.strokeStyle = "#00DFEB";
  ctx.lineWidth = 3;
  chamferedRect(ctx, headerBoxY, headerBoxY, width - headerBoxY * 2, headerBoxH, 20);
  ctx.fill();
  ctx.stroke();

  // --- User Icon ---
  const iconSize = 120;
  const iconX = glassMargin + 40;
  const iconY = headerCenterY - iconSize / 2;
  
  // Icon Border
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
  
  // Helper for Game Mode Text (Outline + Fill)
  const drawGameText = (text: string, x: number, y: number, font: string, align: CanvasTextAlign = "left", outlineWidth: number = 2) => {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    
    // Outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = outlineWidth; 
    ctx.strokeText(text, x, y);
    
    // Fill
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
  drawGameText(profile.name, infoX, headerCenterY, `${nameFontSize}px sans-serif`, "left", 3); // Thin-ish outline
  const nameActualWidth = ctx.measureText(profile.name).width;

  // 2. Rating Group
  const rateGroupX = infoX + nameActualWidth + 30;
  
  drawGameText("RATING", rateGroupX, headerCenterY, "24px sans-serif", "left", 3);
  const labelWidth = ctx.measureText("RATING").width;

  // Rating Value (Dynamic Color)
  const rateNum = parseFloat(profile.rate);
  const valueX = rateGroupX + labelWidth + 15;
  const rateFontSize = 56;
  
  let rateColor = "#00DFEB"; 
  if (rateNum >= 19.0) rateColor = "#FFD700"; 
  else if (rateNum >= 18.0) rateColor = "#C0C0C0";
  else if (rateNum >= 17.0) rateColor = "#CD7F32";
  else if (rateNum >= 16.0) rateColor = "#ff7777";

  ctx.font = `${rateFontSize}px sans-serif`;
  ctx.textAlign = "left";
  ctx.lineJoin = "round";
  
  // Broader outline for numbers as requested
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5; 
  ctx.strokeText(profile.rate, valueX, headerCenterY);
  
  ctx.fillStyle = rateColor;
  ctx.fillText(profile.rate, valueX, headerCenterY);

  // Date Tag
  const dateText = profile.date.replace(/\//g, '.');
  drawGameText(dateText, width - glassMargin - 20, headerBoxY + 20, "14px monospace", "right", 2);

  // --- Graph Area ---
  const graphWidth = 140;
  const graphRightX = width - glassMargin - 30;
  const graphX = graphRightX - graphWidth;
  const graphH = 50;
  const graphY = headerCenterY - graphH / 2 + 10;

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
  // Adjusted for Footer Space
  const contentStartY = 230; 
  const footerH = 50;
  const colGap = 20;
  const colWidth = (width - (glassMargin * 2) - colGap) / 2; 
  const rowHeight = 58; 
  const rowGap = 7; 

  const drawScoreCard = (score: BestImageScore, index: number, x: number, y: number) => {
    ctx.save();
    
    // Card Base
    ctx.fillStyle = "#22363B"; 
    chamferedRect(ctx, x, y, colWidth, rowHeight, 10);
    ctx.fill();
    
    ctx.strokeStyle = "#1682A2";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Progress Bar
    const scoreVal = score.score;
    const progressRatio = Math.max(0, Math.min((scoreVal - 900000) / 100000, 1.0)); 
    if (progressRatio > 0) {
        ctx.save();
        chamferedRect(ctx, x, y, colWidth, rowHeight, 10);
        ctx.clip();
        ctx.fillStyle = "rgba(0, 223, 235, 0.1)"; 
        ctx.fillRect(x, y, colWidth * progressRatio, rowHeight);
        ctx.restore();
    }

    // --- Content ---
    const centerY = y + rowHeight / 2;
    ctx.textBaseline = "middle";

    // 1. Rank
    drawGameText(`${index + 1}`, x + 25, centerY, "bold 16px monospace", "center", 2);
    
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

    // 3. Stats
    const cardPadding = 15;
    const rightEdge = x + colWidth - cardPadding;
    
    // Rate
    const rateText = score.rating;
    drawGameText(rateText, rightEdge, centerY, "bold 24px monospace", "right", 2.5);
    const rateWidth = ctx.measureText(rateText).width;
    
    // Const & Score
    const statsX = rightEdge - rateWidth - 20;
    
    ctx.textAlign = "right";
    ctx.fillStyle = "#9CA3AF"; 
    ctx.font = "bold 13px monospace";
    ctx.fillText(`${score.constVal.toFixed(1)}`, statsX, centerY - 10);
    
    // Score
    ctx.fillStyle = "#E5E7EB"; // Off-white
    ctx.font = "14px monospace";
    ctx.fillText(score.score.toLocaleString(), statsX, centerY + 10);
    
    // 4. Title
    const titleStartX = x + 85; 
    const titleEndX = statsX - 15; 
    const maxTitleW = titleEndX - titleStartX;
    
    let title = score.title || "";
    title = truncateText(ctx, title, maxTitleW);
    drawGameText(title, titleStartX, centerY, "20px sans-serif", "left", 2);

    ctx.restore(); 
  };
  
  scores.slice(0, 40).forEach((score, i) => {
    const colParams = i < 20 ? 0 : 1;
    const rowParams = i % 20;
    
    const x = glassMargin + (colParams * (colWidth + colGap));
    const y = contentStartY + (rowParams * (rowHeight + rowGap));
    
    drawScoreCard(score, i, x, y);
  });
  
  // --- Footer ---
  ctx.save();
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
}

/**
 * --- LIGHT MODE (Legacy/Modern) ---
 * Clean, White, Shadowed Style
 */
async function renderLightMode(ctx: CanvasRenderingContext2D, width: number, height: number, scores: BestImageScore[], profile: BestImageProfile) {
  // Background
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

  // Dots
  ctx.fillStyle = "rgba(100, 116, 139, 0.08)"; 
  const dotSpacing = 40;
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Header
  const glassMargin = 30; 
  const headerHeight = 200; 
  const headerBoxY = glassMargin;
  const headerBoxH = headerHeight - glassMargin; 
  const headerCenterY = headerBoxY + headerBoxH / 2;

  ctx.save();
  ctx.shadowColor = "rgba(148, 163, 184, 0.2)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  roundedRect(ctx, headerBoxY, headerBoxY, width - headerBoxY * 2, headerBoxH, 24);
  ctx.fill();
  ctx.shadowColor = "transparent";
  
  // Icon
  const iconSize = 120;
  const iconX = glassMargin + 40;
  const iconY = headerCenterY - iconSize / 2;
  
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
        await new Promise(r => { img.onload = r; img.onerror = r; });
        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      } catch (e) {
          console.warn("Avatar load failed", e);
      }
  }
  ctx.restore();

  // Text
  const infoX = iconX + iconSize + 30; 
  const rightStatsWidth = 180;
  const maxNameWidth = width - infoX - rightStatsWidth - glassMargin - 20;
  
  ctx.fillStyle = "#1e293b"; 
  ctx.textBaseline = "middle"; 
  
  let nameFontSize = 56;
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  while (ctx.measureText(profile.name).width > maxNameWidth && nameFontSize > 24) {
    nameFontSize -= 2;
    ctx.font = `bold ${nameFontSize}px sans-serif`;
  }
  ctx.fillText(profile.name, infoX, headerCenterY);
  const nameActualWidth = ctx.measureText(profile.name).width;

  const rateGroupX = infoX + nameActualWidth + 30;
  
  // Rating Gradient
  const rateNum = parseFloat(profile.rate);
  let rateFillStyle: string | CanvasGradient = "#0284c7"; 
  if (rateNum >= 19.0) {
     const gradient = ctx.createLinearGradient(rateGroupX, 0, rateGroupX + 250, 0); 
     gradient.addColorStop(0, "#eab308"); 
     gradient.addColorStop(0.5, "#d946ef"); 
     gradient.addColorStop(1, "#0ea5e9"); 
     rateFillStyle = gradient;
  } else if (rateNum >= 18.0) {
     rateFillStyle = "#ca8a04"; 
  }

  ctx.fillStyle = rateFillStyle; 
  ctx.font = "bold 20px sans-serif"; 
  ctx.fillText("RATING", rateGroupX, headerCenterY); 
  const labelWidth = ctx.measureText("RATING").width;

  const valueX = rateGroupX + labelWidth + 15;
  ctx.font = `bold 56px sans-serif`; 
  ctx.fillText(profile.rate, valueX, headerCenterY);

  // Date
  ctx.fillStyle = "#cbd5e1"; 
  ctx.font = "13px monospace";
  ctx.textAlign = "right";
  ctx.fillText(profile.date.replace(/\//g, '.'), width - glassMargin - 30, glassMargin + 30);

  ctx.restore();

  // Score List
  const contentStartY = 230; 
  const colGap = 20;
  const colWidth = (width - (glassMargin * 2) - colGap) / 2; 
  const rowHeight = 59; 
  const rowGap = 7; 

  const drawLightScoreCard = (score: BestImageScore, index: number, x: number, y: number) => {
    const scoreVal = score.score;
    let progressRatio = Math.max(0, Math.min((scoreVal - 800000) / 200000, 1.0));
    progressRatio = Math.pow(progressRatio, 4);
    const progressWidth = colWidth * progressRatio;

    ctx.save();
    ctx.shadowColor = "rgba(148, 163, 184, 0.1)"; 
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "white"; 
    roundedRect(ctx, x, y, colWidth, rowHeight, 8);
    ctx.fill();
    ctx.shadowBlur = 0; 
    
    // Bar
    ctx.save();
    roundedRect(ctx, x, y, colWidth, rowHeight, 8);
    ctx.clip();
    const progGrad = ctx.createLinearGradient(x, y, x + progressWidth, y);
    progGrad.addColorStop(0, "rgba(224, 242, 254, 0.3)"); 
    progGrad.addColorStop(1, "rgba(186, 230, 253, 0.8)"); 
    ctx.fillStyle = progGrad;
    ctx.fillRect(x, y, progressWidth, rowHeight);
    ctx.restore();

    const centerY = y + rowHeight / 2;
    ctx.textBaseline = "middle";

    // Rank
    ctx.fillStyle = "#94a3b8"; 
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${index + 1}`, x + 25, centerY);
    
    // Diff
    const diffColor = getDiffColor(score.difficulty);
    const diffAbbr = getDiffAbbr(score.difficulty);
    ctx.fillStyle = diffColor;
    const barH = 28; 
    roundedRect(ctx, x + 48, centerY - barH/2, 5, barH, 2.5); 
    ctx.fill();
    ctx.fillStyle = diffColor; // Keep same for text in light mode? Or make it white? Original was diffColor.
    // Wait, original file:
    // ctx.fillStyle = diffColor; roundedRect... ctx.fill(); 
    // ctx.fillStyle = diffColor; ctx.fillText(...);
    // So text was colored.
    ctx.font = "bold 16px sans-serif"; 
    ctx.textAlign = "left";
    ctx.fillText({ "NOR":"N", "HRD":"H", "MAS":"M", "INS":"I", "RVG":"R", "UNK":"?" }[diffAbbr] || diffAbbr, x + 62, centerY + 1);

    // Stats
    const cardPadding = 15;
    const rightEdge = x + colWidth - cardPadding;
    
    ctx.textAlign = "right";
    ctx.fillStyle = "#0284c7"; 
    ctx.font = "bold 26px monospace"; 
    const rateText = score.rating;
    ctx.fillText(rateText, rightEdge, centerY); 
    const rateWidth = ctx.measureText(rateText).width;
    
    const statsColor = "#475569"; 
    const statsX = rightEdge - rateWidth - 25;
    ctx.fillStyle = statsColor;

    ctx.font = "bold 14px monospace"; 
    ctx.fillText(`${score.constVal.toFixed(1)}`, statsX, centerY - 10);
    ctx.font = "15px monospace";
    ctx.fillText(score.score.toLocaleString(), statsX, centerY + 10);
    
    // Title
    const titleStartX = x + 90; 
    const titleEndX = statsX - 25; 
    const maxTitleW = titleEndX - titleStartX;
    
    ctx.fillStyle = "#1e293b"; 
    ctx.font = "bold 22px sans-serif"; 
    ctx.textAlign = "left";
    let title = score.title || "";
    title = truncateText(ctx, title, maxTitleW);
    ctx.fillText(title, titleStartX, centerY);

    ctx.restore(); 
  };

  scores.slice(0, 40).forEach((score, i) => {
    const colParams = i < 20 ? 0 : 1;
    const rowParams = i % 20;
    const x = glassMargin + (colParams * (colWidth + colGap));
    const y = contentStartY + (rowParams * (rowHeight + rowGap));
    drawLightScoreCard(score, i, x, y);
  });
  
  const footerH = 50;
  ctx.fillStyle = "#64748b"; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("GENERATED BY TAKUMI³ SCORE MANAGER", width/2, height - footerH/2);
}

/* --- Helpers --- */

// Rounded Rectangle
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number | {tl?:number, tr?:number, br?:number, bl?: number}) {
  ctx.beginPath();
  const r = typeof radius === 'number' ? {tl: radius, tr: radius, br: radius, bl: radius} : radius;
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

// Chamfered Rectangle
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

// function getDiffColor and getDiffAbbr removed, imported from colors.ts
