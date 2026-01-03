import { getDiffColor, getDiffAbbr, getRateColorHex, isRainbowRate, RAINBOW_DIGIT_COLORS } from "./colors";

// Google Fonts URLs (WOFF2 format for best compatibility)
// Noto Sans JP - Japanese text support with clean number design
const NOTO_SANS_JP_REGULAR = "https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFJEk757Y0rw_qMHVdbR2L8Y9QTJ1LwkRmR5GprQAe-T30g.0.woff2";
const NOTO_SANS_JP_BOLD = "https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEk757Y0rw_qMHVdbR2L8Y9QTJ1LwkRmR5GprQAe-T30g.0.woff2";

// Font family names to use in canvas (unified to Noto Sans JP for clean look)
const FONT_SANS = '"Noto Sans JP", sans-serif';
const FONT_MONO = '"Noto Sans JP", sans-serif'; // Using same font for numbers too

// Track if fonts are already loaded
let fontsLoaded = false;

/**
 * Load Google Fonts using FontFace API for consistent cross-device rendering
 */
async function loadFonts(): Promise<void> {
  if (fontsLoaded) return;
  
  try {
    const fonts = [
      new FontFace("Noto Sans JP", `url(${NOTO_SANS_JP_REGULAR})`, { weight: "400" }),
      new FontFace("Noto Sans JP", `url(${NOTO_SANS_JP_BOLD})`, { weight: "700" }),
    ];
    
    const loadedFonts = await Promise.all(fonts.map(font => font.load()));
    loadedFonts.forEach(font => document.fonts.add(font));
    
    fontsLoaded = true;
  } catch (error) {
    console.warn("Failed to load Google Fonts, falling back to system fonts:", error);
  }
}

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

export async function generateBestImage(scores: BestImageScore[], profile: BestImageProfile): Promise<string> {
  // Load Google Fonts before rendering for consistent cross-device appearance
  await loadFonts();
  
  const width = 1200; 
  const height = 1600; 
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  await renderGameMode(ctx, width, height, scores, profile);

  return canvas.toDataURL("image/png");
}

/**
 * --- GAME MODE ---
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
  ctx.font = `${nameFontSize}px ${FONT_SANS}`;
  while (ctx.measureText(profile.name).width > maxNameWidth && nameFontSize > 24) {
    nameFontSize -= 2;
    ctx.font = `${nameFontSize}px ${FONT_SANS}`;
  }
  drawGameText(profile.name, infoX, headerCenterY, `${nameFontSize}px ${FONT_SANS}`, "left", 5); // Thicker outline
  const nameActualWidth = ctx.measureText(profile.name).width;

  // 2. Rating Group
  const rateGroupX = infoX + nameActualWidth + 30;
  
  drawGameText("RATING", rateGroupX, headerCenterY, `24px ${FONT_SANS}`, "left", 3);
  const labelWidth = ctx.measureText("RATING").width;

  // Rating Value (Dynamic Color)
  const rateNum = parseFloat(profile.rate);
  const valueX = rateGroupX + labelWidth + 15;
  const rateFontSize = 56;
  
  ctx.font = `${rateFontSize}px ${FONT_MONO}`;
  ctx.textAlign = "left";
  ctx.lineJoin = "round";
  
  // Broader outline for numbers as requested
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5; 
  ctx.strokeText(profile.rate, valueX, headerCenterY);
  
  // Rainbow gradient for 19+ or solid color for others
  if (isRainbowRate(rateNum)) {
    // Draw each character with specific color per digit position
    const chars = profile.rate.split("");
    let charX = valueX;
    chars.forEach((char, i) => {
      // Use position-based color, fallback to last color if beyond array
      const colorIndex = Math.min(i, RAINBOW_DIGIT_COLORS.length - 1);
      ctx.fillStyle = RAINBOW_DIGIT_COLORS[colorIndex];
      ctx.fillText(char, charX, headerCenterY);
      charX += ctx.measureText(char).width;
    });
  } else {
    ctx.fillStyle = getRateColorHex(rateNum);
    ctx.fillText(profile.rate, valueX, headerCenterY);
  }

  // Date Tag
  const dateText = profile.date.replace(/\//g, '.');
  drawGameText(dateText, width - glassMargin - 20, headerBoxY + 20, `14px ${FONT_MONO}`, "right", 2);

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
    ctx.font = `bold 9px ${FONT_SANS}`;
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

    // Progress Bar (exponential decay: 1,000,000=100%, 800,000=0%)
    // Using power function to make decay feel more dramatic (e.g., 990,000 ≈ 70%)
    const scoreVal = score.score;
    const linearRatio = Math.max(0, Math.min((scoreVal - 800000) / 200000, 1.0));
    const progressRatio = Math.pow(linearRatio, 7); // Exponential curve for dramatic effect
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
    drawGameText(`${index + 1}`, x + 25, centerY, `bold 16px ${FONT_MONO}`, "center", 2);
    
    // 2. Difficulty Tag
    const diffColor = getDiffColor(score.difficulty);
    const diffAbbr = getDiffAbbr(score.difficulty);
    
    ctx.fillStyle = diffColor;
    chamferedRect(ctx, x + 45, centerY - 12, 28, 24, 6);
    ctx.fill();
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold 14px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.fillText({
      "NOR": "N", "HAR": "H", "MAS": "M", "INS": "I", "RVG": "R", "UNK": "?"
    }[diffAbbr] || "?", x + 59, centerY + 1);

    // 3. Stats - Fixed layout to prevent overlap
    const cardPadding = 15;
    const rightEdge = x + colWidth - cardPadding;
    const rateReservedWidth = 90; // Increased gap between rate and const/score
    const statsReservedWidth = 75; // Fixed width for const/score column
    
    // Rate (always white for single song rate)
    const rateText = score.rating;
    drawGameText(rateText, rightEdge, centerY, `bold 24px ${FONT_MONO}`, "right", 2.5);
    const rateWidth = ctx.measureText(rateText).width;
    
    // Const & Score (moved left for more gap)
    const statsX = rightEdge - rateReservedWidth;
    
    // Constant - White text with black border
    drawGameText(`${score.constVal.toFixed(1)}`, statsX, centerY - 10, `bold 14px ${FONT_MONO}`, "right", 3);
    
    // Score - White text with black border
    drawGameText(score.score.toLocaleString(), statsX, centerY + 10, `14px ${FONT_MONO}`, "right", 2.5);
    
    // 4. Title - Fixed max width to prevent overlap
    const titleStartX = x + 85; 
    const titleMaxEndX = statsX - statsReservedWidth - 10;
    const maxTitleW = titleMaxEndX - titleStartX;
    
    ctx.font = `22px ${FONT_SANS}`; // Set font before measuring
    let title = score.title || "";
    title = truncateText(ctx, title, maxTitleW);
    drawGameText(title, titleStartX, centerY, `22px ${FONT_SANS}`, "left", 2);

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
  ctx.font = `14px ${FONT_SANS}`;
  ctx.fillText("GENERATED BY TAKUMI³ SCORE MANAGER", width/2, height - footerH/2);
  ctx.restore();
}

/* --- Helpers --- */

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
