/** @typedef {import("../obstacle")} */
/** @typedef {import("../player")} */
/** @typedef {import("./slasher")} */
/** @typedef {import("./assetmanager")} */
/** @typedef {import("./gameengine")} */

class SceneManager {
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;
        this.game.camera = this;
        this.x = 0;
        this.y = 0;
        
        // map dimensions
        this.mapWidth = 3000;
        this.mapHeight = 768;
        
        // camera bounds
        this.cameraBoundLeft = 500;
        this.cameraBoundRight = 550;

        // Editor mode properties
        this.isEditMode = false;
        this.selectedTool = "platform";
        this.selectedSize = { width: 100, height: 20 };
        this.deleteMode = false;
        this.undoStack = [];
        this.showGrid = true;
        this.gridSize = 16;

        // testing (delete later)
        this.debug = true;

        // Add keyboard shortcut for editor toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                this.toggleEditMode();
            }
        });

        this.initUI();
        this.loadLevel();
    }

    loadLevel() {
        this.player = new Player(this.game, this.assetManager);
        this.game.addEntity(this.player);
        this.createTestLevel();
    }

    createTestLevel() {
        // platform tests
        this.addObstacle(0, 600, 1000, 20, "platform");
        this.addObstacle(300, 400, 100, 20, "platform");
        this.addObstacle(1200, 600, 800, 20, "platform");
        this.addObstacle(2200, 600, 800, 20, "platform");

        // platform tests
        this.addObstacle(1050, 450, 100, 20, "platform");
        this.addObstacle(1400, 400, 100, 20, "platform");
        this.addObstacle(1700, 350, 100, 20, "platform");

        // traps
        this.addObstacle(1000, 550, 50, 50, "spike");
        this.addObstacle(1600, 550, 50, 50, "spike");

        this.game.addEntity(new Slasher(this.game, this.assetManager, 350, 0));
        this.game.addEntity(new Blocker(this.game, this.assetManager, 1400, 550));
        this.game.addEntity(new Shooter(this.game, this.assetManager, 2500, 550));
    }

    addObstacle(x, y, width, height, type) {
        const obstacle = new Obstacle(this.game, x, y, width, height, type);
        this.game.addEntity(obstacle);
        return obstacle;
    }

    update() {
        if (this.isEditMode) {
            this.handleEditorInput();
        }
        this.updateCamera();
        this.updateAudio();
    }

    updateCamera() {
        // only moves camera when player moves past bounds
        if (this.player.position.x - this.x > this.cameraBoundRight) {
            this.x = this.player.position.x - this.cameraBoundRight;
        } else if (this.player.position.x - this.x < this.cameraBoundLeft) {
            this.x = this.player.position.x - this.cameraBoundLeft;
        }

        // camera bounds
        if (this.x < 0) this.x = 0;
        if (this.x > this.mapWidth - this.game.ctx.canvas.width) {
            this.x = this.mapWidth - this.game.ctx.canvas.width;
        }
    }

    updateAudio() {
        let mute = document.getElementById("mute").checked;
        let volume = document.getElementById("volume").value;
        this.assetManager.muteAudio(mute);
        this.assetManager.adjustVolume(volume);
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editorUI = document.getElementById("editorUI");
        if (editorUI) {
            editorUI.style.display = this.isEditMode ? "block" : "none";
        }
    }

    handleEditorInput() {
        if (this.game.click) {
            const { x, y } = this.game.click;
            const worldX = x + this.x;
            const worldY = y;

            if (this.deleteMode) {
                const clickedObstacle = this.game.entities.find(entity => {
                    if (entity instanceof Obstacle) {
                        return worldX >= entity.position.x &&
                               worldX <= entity.position.x + entity.width &&
                               worldY >= entity.position.y && 
                               worldY <= entity.position.y + entity.height;
                    }
                    return false;
                });

                if (clickedObstacle) {
                    clickedObstacle.removeFromWorld = true;
                    this.undoStack.push({
                        action: 'delete',
                        obstacle: clickedObstacle,
                        collider: clickedObstacle.collision
                    });
                    
                    this.game.entities = this.game.entities.filter(e => 
                        e !== clickedObstacle && e !== clickedObstacle.collision
                    );
                }
            } else {
                const snappedX = this.showGrid ? Math.floor(worldX / this.gridSize) * this.gridSize : worldX;
                const snappedY = this.showGrid ? Math.floor(worldY / this.gridSize) * this.gridSize : worldY;
                
                const newObstacle = this.addObstacle(
                    snappedX - this.selectedSize.width / 2,
                    snappedY - this.selectedSize.height / 2,
                    this.selectedSize.width,
                    this.selectedSize.height,
                    this.selectedTool
                );
                
                this.undoStack.push({
                    action: 'add',
                    obstacle: newObstacle
                });
            }

            this.game.click = null;
        }

        // handle undo with Ctrl+Z (bug where asset still causes collision)
        if (this.game.keys["Control"] && this.game.keys["z"]) {
            this.undo();
            this.game.keys["z"] = false;
        }
    }

    undo() {
        if (this.undoStack.length > 0) {
            const lastAction = this.undoStack.pop();
            if (lastAction.action === 'add') {
                this.game.entities = this.game.entities.filter(e => 
                    e !== lastAction.obstacle && e !== lastAction.obstacle.collision
                );
            } else if (lastAction.action === 'delete') {
                this.game.addEntity(lastAction.obstacle);
                this.game.addEntity(lastAction.collider);
            }
        }
    }

    draw(ctx) {
        if (this.debug) {
            this.drawDebugInfo(ctx);
        }
        if (this.isEditMode) {
            if (this.showGrid) {
                this.drawGrid(ctx);
            }
            this.drawEditorOverlay(ctx);
        }
    }

    drawGrid(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        const startX = Math.floor(this.x / this.gridSize) * this.gridSize;
        const endX = startX + ctx.canvas.width + this.gridSize;
        const endY = ctx.canvas.height;

        for (let x = startX; x <= endX; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x - this.x, 0);
            ctx.lineTo(x - this.x, endY);
            ctx.stroke();
        }

        for (let y = 0; y <= endY; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawEditorOverlay(ctx) {
        ctx.save();
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(800, 10, 200, 60);
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(`Mode: ${this.deleteMode ? 'Delete' : 'Place'}`, 850, 30);
        ctx.fillText(`Tool: ${this.selectedTool}`, 850, 50);
        
        if (this.game.mouse && !this.deleteMode) {
            const { x, y } = this.game.mouse;
            const worldX = x + this.x;
            const worldY = y;
            
            const snappedX = this.showGrid ? Math.floor(worldX / this.gridSize) * this.gridSize : worldX;
            const snappedY = this.showGrid ? Math.floor(worldY / this.gridSize) * this.gridSize : worldY;
            
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.selectedTool === "platform" ? "gray" : "red";
            ctx.fillRect(
                snappedX - this.selectedSize.width / 2 - this.x,
                snappedY - this.selectedSize.height / 2,
                this.selectedSize.width,
                this.selectedSize.height
            );
            ctx.globalAlpha = 1.0;
        }
        
        ctx.restore();
    }

    drawDebugInfo(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        
        ctx.fillText(`Camera: ${Math.floor(this.x)}, ${Math.floor(this.y)}`, 10, 20);
        ctx.fillText(`Player: ${Math.floor(this.player.position.x)}, ${Math.floor(this.player.position.y)}`, 10, 40);
        ctx.fillText(`Velocity: ${Math.floor(this.player.velocity.x)}, ${Math.floor(this.player.velocity.y)}`, 10, 60);
        if (this.game.mouse != null) ctx.fillText(`Mouse: ${this.game.mouse.x}, ${this.game.mouse.y}`, 10, 80);
        ctx.fillText(`ScreenPos: ${Math.floor(this.player.position.x)-Math.floor(this.x)}, ${Math.floor(this.player.position.y)-Math.floor(this.y)}`, 10, 100);
        
        
        
        
        const boundLeft = this.cameraBoundLeft;
        const boundRight = this.cameraBoundRight;
        
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(boundLeft, 0);
        ctx.lineTo(boundLeft, ctx.canvas.height);
        ctx.moveTo(boundRight, 0);
        ctx.lineTo(boundRight, ctx.canvas.height);
        ctx.stroke();
        
        ctx.restore();
    }

    // Clean up / abstract later
    initUI() {
        const editorUI = document.createElement("div");
        editorUI.id = "editorUI";
        editorUI.style.position = "absolute";
        editorUI.style.top = "10px";
        editorUI.style.right = "10px";
        editorUI.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        editorUI.style.padding = "10px";
        editorUI.style.display = "none";
        editorUI.style.border = "2px solid black";
        editorUI.style.borderRadius = "5px";
        editorUI.style.zIndex = "1000";

        editorUI.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold;">Editor Controls</div>
            <select id="toolSelect" style="margin-bottom: 10px; width: 100%;">
                <option value="platform">Platform</option>
                <option value="spike">Spike</option>
            </select>
            <div style="margin-bottom: 10px;">
                <label>Size:</label>
                <div style="display: flex; gap: 5px;">
                    <input type="number" id="widthInput" value="100" style="width: 70px;">
                    <input type="number" id="heightInput" value="20" style="width: 70px;">
                </div>
            </div>
            <button id="deleteMode">Delete Mode (Del)</button>
            <button id="toggleGrid">Toggle Grid</button>
        `;

        document.body.appendChild(editorUI);

        document.getElementById("toolSelect").addEventListener("change", (e) => {
            this.selectedTool = e.target.value;
        });

        document.getElementById("widthInput").addEventListener("change", (e) => {
            this.selectedSize.width = parseInt(e.target.value);
        });

        document.getElementById("heightInput").addEventListener("change", (e) => {
            this.selectedSize.height = parseInt(e.target.value);
        });

        document.getElementById("deleteMode").addEventListener("click", () => {
            this.deleteMode = !this.deleteMode;
            document.getElementById("deleteMode").style.backgroundColor = 
                this.deleteMode ? "#ff4444" : "#4CAF50";
        });

        document.getElementById("toggleGrid").addEventListener("click", () => {
            this.showGrid = !this.showGrid;
            document.getElementById("toggleGrid").style.backgroundColor = 
                this.showGrid ? "#4CAF50" : "#808080";
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete') {
                this.deleteMode = !this.deleteMode;
                document.getElementById("deleteMode").style.backgroundColor = 
                    this.deleteMode ? "#ff4444" : "#4CAF50";
            }
        });
    }
} 