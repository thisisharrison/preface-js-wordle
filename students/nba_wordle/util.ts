export function buildArtifacts(TILES, LENGTH): HTMLDivElement[][] {
    return buildBoard(TILES, LENGTH);
}

function buildBoard(TILES, LENGTH): HTMLDivElement[][] {
    const wrapper = document.createElement("div");
    wrapper.id = "board";
    let row = document.createElement("div");
    row.className = "row";
    const TILES_NODES: HTMLDivElement[] = [];
    const TILES_ROWS: HTMLDivElement[] = [];
    TILES.forEach((_, i) => {
        if (i % LENGTH === 0 && i !== 0) {
            wrapper.appendChild(row);
            TILES_ROWS.push(row);
            row = document.createElement("div");
            row.className = "row";
        }
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset["status"] = "empty";
        tile.onanimationend = () => {
            tile.dataset["animation"] = "idle";
        };
        TILES_NODES.push(tile);
        row.appendChild(tile);
    });
    wrapper.appendChild(row);
    TILES_ROWS.push(row);
    document.querySelector("#board-container")!.appendChild(wrapper);
    return [TILES_NODES, TILES_ROWS];
}
