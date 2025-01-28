class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;
        this.x = 0;
        this.y = 0;

        // Map dimensions
        this.mapWidth = 3000;
        this.mapHeight = 768;
<<<<<<< Updated upstream:scenemanager.js
        
        // camera bounds
        this.cameraBoundLeft = 200;
        this.cameraBoundRight = 800;

        // testing (delete later)
        this.debug = true;
        
=======

        // Camera bounds and movement
        this.cameraBoundLeft = 500;
        this.cameraBoundRight = 550;
        this.cameraSpeed = 10;
        
        // Virtual camera target for editor mode
        this.editorCameraTarget = {
            position: { x: 0, y: 0 },
            moveSpeed: 400  // Units per second
        };

        // Grid settings
        this.gridSize = 16;
        this.showGrid = true;

        // Editor mode toggle
        this.isEditMode = false;
        this.selectedTool = "platform";
        this.placementPreview = null;
        this.undoStack = [];
        this.selectedSize = { width: 100, height: 20 };
        this.deleteMode = false;

        // Track last key states for proper key combination handling
        this.lastKeyStates = {
            Control: false,
            z: false
        };

        // Initialize player first
>>>>>>> Stashed changes:src/engine/scenemanager.js
        this.loadLevel();
        this.initUI();

        // Add keyboard listeners after initialization
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {  // Handle both backtick and tilde
                this.toggleEditMode();
            }
            // Track key states
            this.lastKeyStates[e.key] = true;
            
            // Handle Ctrl+Z properly
            if (this.lastKeyStates.Control && this.lastKeyStates.z) {
                this.undo();
                this.lastKeyStates.z = false; // Prevent multiple undos
            }
        });

        document.addEventListener('keyup', (e) => {
            this.lastKeyStates[e.key] = false;
        });
    }

    loadLevel() {
<<<<<<< Updated upstream:scenemanager.js
        this.player = new Player(this.game);
=======
        // Create the player first
        this.player = new Player(this.game, this.assetManager);
>>>>>>> Stashed changes:src/engine/scenemanager.js
        this.game.addEntity(this.player);
        
        // Add initial platforms
        this.createTestLevel();
    }

    createTestLevel() {
        // Example initial obstacles
        this.addObstacle(0, 600, 1000, 20, "platform");
        this.addObstacle(1200, 600, 800, 20, "platform");
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editorUI = document.getElementById("editorUI");
        if (editorUI) {
            editorUI.style.display = this.isEditMode ? "block" : "none";
        }
        
        // When entering edit mode, set editor camera target to current camera position
        if (this.isEditMode) {
            this.editorCameraTarget.position.x = this.x + this.cameraBoundLeft;
            console.log("Editor Mode Enabled - Press ` to toggle");
        } else {
            console.log("Editor Mode Disabled");
        }
    }

<<<<<<< Updated upstream:scenemanager.js
    update() {
        this.updateCamera();
    }

    updateCamera() {
        // only moves camera when player moves past bounds
        if (this.player.x - this.x > this.cameraBoundRight) {
            this.x = this.player.x - this.cameraBoundRight;
        } else if (this.player.x - this.x < this.cameraBoundLeft) {
            this.x = this.player.x - this.cameraBoundLeft;
=======
    addObstacle(x, y, width, height, type, color = "gray") {
        const obstacle = new Obstacle(this.game, x, y, width, height, type, color);
        this.game.addEntity(obstacle);
        return obstacle;
    }

    update() {
        // Handle camera movement based on mode
        if (this.isEditMode) {
            this.handleEditorInput();
            this.handleEditorCamera(); // Free camera movement in edit mode
        } else {
            this.updateCamera(); // Follow player in game mode
        }
    }

    handleEditorCamera() {
        // Simply follow the player like normal
        if (this.player) {
            if (this.player.position.x - this.x > this.cameraBoundRight) {
                this.x = this.player.position.x - this.cameraBoundRight;
            } else if (this.player.position.x - this.x < this.cameraBoundLeft) {
                this.x = this.player.position.x - this.cameraBoundLeft;
            }
        }

        // Clamp camera position
        this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.game.ctx.canvas.width));
    }

    updateCamera() {
        if (!this.isEditMode && this.player) {
            if (this.player.position.x - this.x > this.cameraBoundRight) {
                this.x = this.player.position.x - this.cameraBoundRight;
            } else if (this.player.position.x - this.x < this.cameraBoundLeft) {
                this.x = this.player.position.x - this.cameraBoundLeft;
            }

            // Clamp camera to map bounds
            this.x = Math.max(0, Math.min(this.x, this.mapWidth - this.game.ctx.canvas.width));
        }
    }

    handleEditorInput() {
        if (this.game.mouse) {
            const { x, y } = this.game.mouse;
            const worldX = x + this.x;
            const worldY = y;

            const snappedX = this.showGrid ? Math.floor(worldX / this.gridSize) * this.gridSize : worldX;
            const snappedY = this.showGrid ? Math.floor(worldY / this.gridSize) * this.gridSize : worldY;
            
            this.placementPreview = {
                x: snappedX - this.selectedSize.width / 2,
                y: snappedY - this.selectedSize.height / 2,
                width: this.selectedSize.width,
                height: this.selectedSize.height,
                type: this.selectedTool
            };
>>>>>>> Stashed changes:src/engine/scenemanager.js
        }

        if (this.game.click) {
            const { x, y } = this.game.click;
            const worldX = x + this.x;
            const worldY = y;

            if (this.deleteMode) {
                const clickedObstacle = this.game.entities.find(entity => {
                    if (entity instanceof Obstacle) {
                        const bounds = entity.collision.getBounds();
                        return worldX >= bounds.xStart && worldX <= bounds.xEnd &&
                               worldY >= bounds.yStart && worldY <= bounds.yEnd;
                    }
                    return false;
                });

                if (clickedObstacle) {
                    // store the obstacles properties for undo
                    this.undoStack.push({
                        action: 'delete',
                        obstacle: {
                            position: { x: clickedObstacle.position.x, y: clickedObstacle.position.y },
                            width: clickedObstacle.width,
                            height: clickedObstacle.height,
                            type: clickedObstacle.type,
                            color: clickedObstacle.color
                        }
                    });
                    
                    // remove from entities and clear collision
                    this.game.entities = this.game.entities.filter(e => e !== clickedObstacle);
                    if (clickedObstacle.collision) {
                        clickedObstacle.collision = null;
                    }
                    clickedObstacle.removeFromWorld = true;
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
    }
    
    // TODO MAJOR BUG
    // issue with collision still remaining may be due to something in collision 
    undo() {
        if (this.undoStack.length > 0) {
            const lastAction = this.undoStack.pop();
            if (lastAction.action === 'add') {
                // Remove from entities array
                this.game.entities = this.game.entities.filter(e => e !== lastAction.obstacle);
                // Clear collision components
                if (lastAction.obstacle.collision) {
                    lastAction.obstacle.collision = null;
                }
                lastAction.obstacle.removeFromWorld = true;
            } else if (lastAction.action === 'delete') {
                // Create a fresh obstacle instead of reusing the old one
                const obs = lastAction.obstacle;
                const newObstacle = this.addObstacle(
                    obs.position.x,
                    obs.position.y,
                    obs.width,
                    obs.height,
                    obs.type,
                    obs.color
                );
            }
        }
    }

    draw(ctx) {
        if (this.isEditMode) {
            // draw grid if enabled
            if (this.showGrid) {
                this.drawGrid(ctx);
            }
            this.drawEditorOverlay(ctx);
        }
    }

    drawGrid(ctx) {
        ctx.save();
<<<<<<< Updated upstream:scenemanager.js
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        
        ctx.fillText(`Camera: ${Math.floor(this.x)}, ${Math.floor(this.y)}`, 10, 20);
        ctx.fillText(`Player: ${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}`, 10, 40);
        ctx.fillText(`Velocity: ${Math.floor(this.player.xV)}, ${Math.floor(this.player.yV)}`, 10, 60);
        
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
        
=======
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

>>>>>>> Stashed changes:src/engine/scenemanager.js
        ctx.restore();
    }

    drawEditorOverlay(ctx) {
        ctx.save();
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(10, 10, 200, 60);
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(`Mode: ${this.deleteMode ? 'Delete' : 'Place'}`, 20, 30);
        ctx.fillText(`Tool: ${this.selectedTool}`, 20, 50);
        
        if (this.placementPreview && !this.deleteMode) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = this.selectedTool === "platform" ? "gray" : "red";
            ctx.fillRect(
                this.placementPreview.x - this.x,
                this.placementPreview.y,
                this.placementPreview.width,
                this.placementPreview.height
            );
            ctx.globalAlpha = 1.0;
        }
        a
        ctx.restore();
    }
    
    // Abstract later
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
            <label for="toolSelect">Select Tool:</label>
            <select id="toolSelect" style="margin-bottom: 10px; width: 100%;">
                <option value="platform">Platform</option>
                <option value="spike">Spike</option>
            </select>
            <div style="margin-bottom: 10px;">
                <label>Size:</label>
                <div style="display: flex; gap: 5px;">
                    <input type="number" id="widthInput" placeholder="Width" value="100" style="width: 70px;">
                    <input type="number" id="heightInput" placeholder="Height" value="20" style="width: 70px;">
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <button id="deleteMode" style="padding: 5px;">Toggle Delete Mode (Del)</button>
                <button id="undoButton" style="padding: 5px;">Undo (Ctrl+Z)</button>
                <button id="gridToggle" style="padding: 5px;">Toggle Grid</button>
                <button id="saveMap" style="padding: 5px;">Save Map</button>
                <input id="loadMap" type="file" accept="application/json" style="margin: 5px 0;" />
                <button id="togglePlay" style="padding: 5px;">Toggle Edit Mode (\`)</button>
            </div>
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

        document.getElementById("gridToggle").addEventListener("click", () => {
            this.showGrid = !this.showGrid;
            document.getElementById("gridToggle").style.backgroundColor = 
                this.showGrid ? "#4CAF50" : "#808080";
        });

        document.getElementById("undoButton").addEventListener("click", () => {
            this.undo();
        });

        document.getElementById("saveMap").addEventListener("click", () => {
            this.saveMap();
        });

        document.getElementById("loadMap").addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.loadMap(event.target.result);
                };d
                reader.readAsText(file);
            }
        });

        document.getElementById("togglePlay").addEventListener("click", () => {
            this.toggleEditMode();
        });

        // need to get delete working first (QOL stuff)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete') {
                this.deleteMode = !this.deleteMode;
                document.getElementById("deleteMode").style.backgroundColor = 
                    this.deleteMode ? "#ff4444" : "#4CAF50";
            }
        });
        
    }
}