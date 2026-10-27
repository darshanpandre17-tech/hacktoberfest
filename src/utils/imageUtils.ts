import { AttachedImage } from '../types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_DIMENSION = 1600; // Resizes ultra-high-res phone camera shots for rapid transfer

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function processImageFile(file: File): Promise<AttachedImage> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported scroll format (${file.type || 'unknown'}). Please offer a JPEG, PNG, WEBP, or GIF image.`
    );
  }

  // Load into HTML Image
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read parchment file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let { width, height } = img;

        // Resize if larger than max dimension
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to initialize canvas context.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-friendly jpeg/png dataUrl
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, 0.88);
        const base64 = dataUrl.split(',')[1] || '';

        // Approximate byte size
        const approxBytes = Math.round((base64.length * 3) / 4);

        resolve({
          name: file.name,
          mimeType: outputMime,
          base64,
          dataUrl,
          sizeFormatted: formatFileSize(approxBytes),
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Generates a sample academic homework parchment image via canvas
export function generateSampleMathImage(): AttachedImage {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d')!;

  // Dark parchment Halloween background
  ctx.fillStyle = '#160d29';
  ctx.fillRect(0, 0, 640, 420);

  // Border glow
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 616, 396);

  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 18, 604, 384);

  // Spooky header
  ctx.fillStyle = '#fed7aa';
  ctx.font = 'bold 22px serif';
  ctx.fillText('📜 Spectral Mathematics Assignment #3', 35, 55);

  ctx.fillStyle = '#c084fc';
  ctx.font = '14px monospace';
  ctx.fillText('Student: Scholar Apprentice | Date: All Hallows Eve', 35, 80);

  // Divider line
  ctx.strokeStyle = '#6b21a8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 95);
  ctx.lineTo(605, 95);
  ctx.stroke();

  // Problem 1: Triangle diagram
  ctx.fillStyle = '#f3f0fa';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Problem 1: Right-Angled Triangle Geometry', 35, 130);

  // Draw triangle
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 320); // bottom-left
  ctx.lineTo(260, 320); // bottom-right
  ctx.lineTo(260, 180); // top-right
  ctx.closePath();
  ctx.stroke();

  // Right angle indicator
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(245, 305, 15, 15);

  // Labels
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Base a = 8 cm', 130, 345);
  ctx.fillText('Height b = 6 cm', 270, 255);
  ctx.fillText('Hypotenuse c = ?', 110, 230);

  // Math question on the right side
  ctx.fillStyle = '#e9d5ff';
  ctx.font = '16px serif';
  ctx.fillText('Tasks to solve:', 360, 160);
  ctx.font = '15px sans-serif';
  ctx.fillText('1. Calculate length of hypotenuse c.', 360, 195);
  ctx.fillText('2. Find angle θ opposite to height b.', 360, 230);
  ctx.fillText('3. Calculate the triangle area.', 360, 265);

  // Ghost watermark in corner
  ctx.font = '36px sans-serif';
  ctx.fillText('👻', 550, 350);

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1] || '';

  return {
    name: 'sample_geometry_homework.png',
    mimeType: 'image/png',
    base64,
    dataUrl,
    sizeFormatted: '45 KB',
  };
}

// Generates a sample velocity-time graph homework parchment
export function generateSampleVelocityGraphImage(): AttachedImage {
  const canvas = document.createElement('canvas');
  canvas.width = 680;
  canvas.height = 440;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0f091f';
  ctx.fillRect(0, 0, 680, 440);

  // Border glow
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 660, 420);

  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1;
  ctx.strokeRect(15, 15, 650, 410);

  // Header
  ctx.fillStyle = '#fed7aa';
  ctx.font = 'bold 20px serif';
  ctx.fillText('⚡ Spectral Physics: Velocity-Time Graph Analysis', 30, 48);

  ctx.fillStyle = '#c084fc';
  ctx.font = '13px monospace';
  ctx.fillText('Find: Distance vs Displacement & Area Under Curve', 30, 70);

  // Graph Origin and Axes
  // Origin (X=80, Y=260) represents t=0, v=0
  const originX = 80;
  const originY = 260;
  const scaleX = 45; // 45px per second (0 to 10s = 450px)
  const scaleY = 14; // 14px per m/s (10 m/s = 140px above, -5 m/s = 70px below)

  // Grid lines
  ctx.strokeStyle = '#271746';
  ctx.lineWidth = 1;

  // Horizontal grids (v = -5, 0, 5, 10)
  [-5, 0, 5, 10].forEach((v) => {
    const y = originY - v * scaleY;
    ctx.beginPath();
    ctx.moveTo(originX, y);
    ctx.lineTo(originX + 10 * scaleX, y);
    ctx.stroke();

    ctx.fillStyle = v === 0 ? '#fb923c' : '#a78bfa';
    ctx.font = '12px monospace';
    ctx.fillText(`${v}`, originX - 30, y + 4);
  });

  // Vertical grids (t = 0..10)
  for (let t = 0; t <= 10; t++) {
    const x = originX + t * scaleX;
    ctx.beginPath();
    ctx.moveTo(x, originY - 10 * scaleY);
    ctx.lineTo(x, originY + 5 * scaleY);
    ctx.stroke();

    ctx.fillStyle = '#a78bfa';
    ctx.font = '12px monospace';
    ctx.fillText(`${t}`, x - 4, originY + 20);
  }

  // Axes lines
  ctx.strokeStyle = '#e9d5ff';
  ctx.lineWidth = 2;

  // X axis (t)
  ctx.beginPath();
  ctx.moveTo(originX - 10, originY);
  ctx.lineTo(originX + 10 * scaleX + 20, originY);
  ctx.stroke();

  // Y axis (v)
  ctx.beginPath();
  ctx.moveTo(originX, originY + 5 * scaleY + 15);
  ctx.lineTo(originX, originY - 10 * scaleY - 15);
  ctx.stroke();

  // Axis Labels
  ctx.fillStyle = '#fb923c';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Time t (s) →', originX + 10 * scaleX - 40, originY + 40);

  ctx.save();
  ctx.translate(originX - 45, originY - 50);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Velocity v (m/s) →', 0, 0);
  ctx.restore();

  // Shaded positive area under curve (t = 0 to 8s)
  ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
  ctx.beginPath();
  ctx.moveTo(originX, originY); // (0, 0)
  ctx.lineTo(originX + 4 * scaleX, originY - 10 * scaleY); // (4, 10)
  ctx.lineTo(originX + 7 * scaleX, originY - 10 * scaleY); // (7, 10)
  ctx.lineTo(originX + 8 * scaleX, originY); // (8, 0)
  ctx.closePath();
  ctx.fill();

  // Shaded negative area (t = 8 to 10s)
  ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
  ctx.beginPath();
  ctx.moveTo(originX + 8 * scaleX, originY); // (8, 0)
  ctx.lineTo(originX + 9 * scaleX, originY + 5 * scaleY); // (9, -5)
  ctx.lineTo(originX + 10 * scaleX, originY); // (10, 0)
  ctx.closePath();
  ctx.fill();

  // Plot Line
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + 4 * scaleX, originY - 10 * scaleY);
  ctx.lineTo(originX + 7 * scaleX, originY - 10 * scaleY);
  ctx.lineTo(originX + 8 * scaleX, originY);
  ctx.lineTo(originX + 9 * scaleX, originY + 5 * scaleY);
  ctx.lineTo(originX + 10 * scaleX, originY);
  ctx.stroke();

  // Plotted Coordinate Dots
  const points = [
    { t: 0, v: 0, label: '(0,0)' },
    { t: 4, v: 10, label: '(4,10)' },
    { t: 7, v: 10, label: '(7,10)' },
    { t: 8, v: 0, label: '(8,0)' },
    { t: 9, v: -5, label: '(9,-5)' },
    { t: 10, v: 0, label: '(10,0)' },
  ];

  ctx.fillStyle = '#ffffff';
  points.forEach((pt) => {
    const px = originX + pt.t * scaleX;
    const py = originY - pt.v * scaleY;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(pt.label, px - 12, pt.v >= 0 ? py - 8 : py + 16);
    ctx.fillStyle = '#ffffff';
  });

  // Task text at bottom
  ctx.fillStyle = '#e9d5ff';
  ctx.font = '13px sans-serif';
  ctx.fillText(
    '1. Calculate distance traveled from t = 0 to 8 s: Area = (1/2·4·10) + (3·10) + (1/2·1·10) = 55 m.',
    30,
    380
  );
  ctx.fillText(
    '2. From t = 0 to 10 s: Compare Distance (60 m) vs Displacement (50 m) with negative velocity.',
    30,
    405
  );

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1] || '';

  return {
    name: 'velocity_time_graph.png',
    mimeType: 'image/png',
    base64,
    dataUrl,
    sizeFormatted: '52 KB',
  };
}
