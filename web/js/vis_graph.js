const example_data = {
    "nodes": [
        {"level": 0, "label": "Root", "id": 0, "parent": 0},
        {"level": 1, "label": "Child 1", "id": 1, "parent": 0},
        {"level": 1, "label": "Child 2", "id": 2, "parent": 0},
        {"level": 2, "label": "Child 1 of Child 2", "id": 3, "parent": 0},
        {"level": 2, "label": "Child 2 of Child 2", "id": 4, "parent": 2},
        {"level": 1, "label": "Child 3", "id": 5, "parent": 2},
        {"level": 1, "label": "Child 4", "id": 6, "parent": 0},
        {"level": 2, "label": "Child 1 of Child 4", "id": 7, "parent": 0},
        {"level": 2, "label": "Child 2 of Child 4", "id": 8, "parent": 6}
    ],
    "edges": [
        {"from": 0, "to": 1}, {"from": 0, "to": 2},
        {"from": 0, "to": 1}, {"from": 0, "to": 2},
        {"from": 2, "to": 3}, {"from": 2, "to": 4},
        {"from": 0, "to": 5}, {"from": 0, "to": 6},
        {"from": 6, "to": 7}, {"from": 6, "to": 8}
    ]
}


const bgcolors1 = [
    "#222f3e",
    "#576574",
    "#c8d6e5",
    "#48dbfb",
    "#0abde3",
    "#2e86de",
    "#54a0ff",
    "#5f27cd",
    "#341f97"
];

const bgcolors = [
    "#f6b93b",
    "#e55039",
    "#4a69bd",
    "#60a3bc",
    "#78e08f",
    "#fad390",
    "#f8c291",
    "#6a89cc",
    "#82ccdd",
    "#b8e994"
];


const createChart = function(containerId, w, h, data=null) {
    // create a network
    if (data == null) {
        data = example_data;
    }

    var container = document.getElementById(containerId);
    container.style.width = w;
    container.style.height = h;
    var options = {
        nodes: {
            margin: 10,
            shape: "box",
            size: 16,
            scaling: {
                min: 10,
                max: 100,
                label: {
                    enabled: true
                }
            }
        },
        edges: {
            scaling: {
                min: 0.1,
                max: 1
            },
            color: {
                inherit: 'to'
            }
        },
        physics: {
            forceAtlas2Based: {
            gravitationalConstant: -26,
            centralGravity: 0.005,
            springLength: 230,
            springConstant: 0.18
            },
            // avoidOverlap: 1,
            maxVelocity: 300,
            solver: "forceAtlas2Based",
            timestep: 0.35,
            stabilization: { iterations: 150 }
        },
        groups: {
            0: {color:{background: bgcolors[0], border: bgcolors[0]}, font:{color:'white'}},
            1: {color:{background: bgcolors[1], border: bgcolors[1]}, font:{color:'white'}},
            2: {color:{background: bgcolors[2], border: bgcolors[2]}, font:{color:'white'}},
            3: {color:{background: bgcolors[3], border: bgcolors[3]}, font:{color:'white'}},
            4: {color:{background: bgcolors[4], border: bgcolors[4]}, font:{color:'white'}},
            5: {color:{background: bgcolors[5], border: bgcolors[5]}, font:{color:'white'}},
            6: {color:{background: bgcolors[6], border: bgcolors[6]}, font:{color:'white'}},
            7: {color:{background: bgcolors[7], border: bgcolors[7]}, font:{color:'white'}},
          }
    };
    var network = new vis.Network(container, data, options);
    return network;
};

export {
    createChart
};
