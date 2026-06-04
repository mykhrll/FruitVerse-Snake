// ============================================
// MapRenderer — Handles drawing the map, grid, and background effects
// Equivalent to Map rendering part in Java
// ============================================

export class MapRenderer {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.particles = [];
        this.currentMapName = '';
        this.time = 0;
    }

    initParticles(mapType, canvasW, canvasH) {
        this.currentMapName = mapType.name;
        this.particles = [];
        const numParticles = (mapType.name === 'DESERT' || mapType.name === 'SNOW') ? 150 : 60;
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * canvasW,
                y: Math.random() * canvasH,
                size: Math.random() * 3 + 1,
                speedY: Math.random() * 1.5 + 0.5,
                speedX: (Math.random() - 0.5) * 1.5,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    updateParticles(canvasW, canvasH, mapType) {
        this.time += 0.05;
        for (let p of this.particles) {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotSpeed;

            // Type specific behavior
            if (mapType.particleType === 'leaves') {
                p.speedX = Math.sin(this.time + p.y * 0.01) * 1.5;
                p.speedY = 1.5;
            } else if (mapType.particleType === 'sand') {
                p.speedX = (p.speedY + 2) * 3; // Fast blow to right
                p.speedY = Math.sin(this.time + p.x * 0.05) * 0.5 + 0.2;
            } else if (mapType.particleType === 'snow') {
                p.speedX = Math.sin(this.time + p.y * 0.02) * 0.5;
            } else if (mapType.particleType === 'neon') {
                p.speedY = -1.5; // Float up
            } else if (mapType.particleType === 'dark') {
                p.speedY = -0.5;
                p.speedX = Math.sin(this.time + p.y * 0.01) * 0.5;
            }

            // Wrap around
            if (p.y > canvasH + 20) p.y = -20;
            else if (p.y < -20) p.y = canvasH + 20;
            if (p.x > canvasW + 20) p.x = -20;
            else if (p.x < -20) p.x = canvasW + 20;
        }
    }

    render(ctx, mapType, cellSize, canvasW, canvasH) {
        // Re-init particles if map changed
        if (this.currentMapName !== mapType.name) {
            this.initParticles(mapType, canvasW, canvasH);
        }

        // Draw background
        ctx.fillStyle = mapType.bgColor;
        ctx.fillRect(0, 0, canvasW, canvasH);
        
        // Map-specific background gradient/pattern for more distinction
        if (mapType.name === 'DESERT') {
            // Draw moving sand dunes
            ctx.fillStyle = 'rgba(200, 160, 100, 0.15)';
            ctx.beginPath();
            ctx.moveTo(0, canvasH);
            for (let x = 0; x <= canvasW; x += 20) {
                ctx.lineTo(x, canvasH - 50 + Math.sin(x * 0.01 + this.time * 0.5) * 30);
            }
            ctx.lineTo(canvasW, canvasH);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(230, 180, 110, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, canvasH);
            for (let x = 0; x <= canvasW; x += 20) {
                ctx.lineTo(x, canvasH - 80 + Math.sin(x * 0.015 + this.time * 0.3 + 2) * 40);
            }
            ctx.lineTo(canvasW, canvasH);
            ctx.fill();
        } else if (mapType.name === 'FOREST') {
            // Swaying trees/canopy along the edges
            ctx.fillStyle = 'rgba(46, 125, 50, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (let x = 0; x <= canvasW; x += 40) {
                ctx.lineTo(x, 20 + Math.sin(x * 0.05 + this.time) * 10);
            }
            ctx.lineTo(canvasW, 0);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, canvasH);
            for (let x = 0; x <= canvasW; x += 40) {
                ctx.lineTo(x, canvasH - 20 - Math.sin(x * 0.04 + this.time * 0.8) * 15);
            }
            ctx.lineTo(canvasW, canvasH);
            ctx.fill();
        } else if (mapType.name === 'SNOW') {
            // Snow drifts
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, canvasH);
            for (let x = 0; x <= canvasW; x += 50) {
                ctx.lineTo(x, canvasH - 40 - Math.sin(x * 0.02) * 20);
            }
            ctx.lineTo(canvasW, canvasH);
            ctx.fill();
        } else if (mapType.name === 'NEON') {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for(let i=0; i<canvasW; i+=cellSize*2) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvasH); ctx.stroke(); }
            for(let i=0; i<canvasH; i+=cellSize*2) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvasW,i); ctx.stroke(); }
        }

        // Draw grid
        ctx.strokeStyle = mapType.gridColor;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= this.cols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, this.rows * cellSize);
            ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(this.cols * cellSize, y * cellSize);
            ctx.stroke();
        }

        // Particles
        this.updateParticles(canvasW, canvasH, mapType);
        this._drawParticles(ctx, mapType);
    }

    _drawParticles(ctx, mapType) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            const type = mapType.particleType;
            if (type === 'leaves') {
                ctx.fillStyle = p.opacity > 0.35 ? '#66bb6a' : '#a5d6a7';
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 2, p.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'sand') {
                ctx.fillStyle = '#e6c896';
                ctx.fillRect(0, 0, p.size * 4, p.size);
            } else if (type === 'snow') {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'neon') {
                const colors = ['#e040fb', '#00e5ff', '#76ff03', '#ffeb3b'];
                ctx.fillStyle = colors[Math.floor(p.size) % colors.length];
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (type === 'dark') {
                ctx.fillStyle = '#7e57c2';
                ctx.globalAlpha = p.opacity * 0.6;
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 2.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    drawWalls(ctx, walls, cellSize, mapType) {
        ctx.fillStyle = mapType.wallColor;
        ctx.shadowColor = mapType.wallColor;
        ctx.shadowBlur = 10;
        
        for (const [wx, wy] of walls) {
            ctx.fillRect(wx * cellSize, wy * cellSize, cellSize, cellSize);
            // Draw inner detail
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(wx * cellSize + 2, wy * cellSize + 2, cellSize - 4, cellSize - 4);
            ctx.fillStyle = mapType.wallColor;
        }
        ctx.shadowBlur = 0;
    }
}
