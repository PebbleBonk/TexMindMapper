import * as visor from './vis_graph.js';

var network=null;


document.addEventListener("DOMContentLoaded", function(event) {
    // network = visor.createChart("svgcontainer",  window.innerWidth, window.innerHeight );
    setupTexUploader();
    // Sets up the open-hidden-input-with-button -combo:
    document.getElementById('file-input-btn').addEventListener('click', function() {
        document.getElementById('file-input').click();
    });
    // Setup the example laoder:
    setupExampleLoader();


});


async function graphFromTexFiles(files) {
    // Check if we have only one file:
    let texText = ''
    if (files.length == 1) {
        texText = await loadTexProject2String(files, files[0].name);
    } else {
        texText = await loadTexProject2String(files);
    }
    // Create the graph:
    graphFromTexString(texText)
    .then((d) => {
        const graph = d['graph'];
        network = visor.createChart("svgcontainer",  window.innerWidth, window.innerHeight, graph);
    })
    .catch(function(e) {
        console.log("Failed creating a graph from the data", e)
    });
}


const graphFromTexString = async function(textext) {
    var api_url = window.location.protocol;
    let mmurl = api_url.concat('/api/parse/tex/text');

    const response = await fetch(mmurl, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"tex": textext})
    });
    return response.json(); // parses JSON response into native JavaScript objects
}


function setupTexUploader() {
    document.getElementById('file-input').addEventListener('change', function (evt) {
        // Get the files from the input:
        let files = document.getElementById('file-input').files;

        // Update file name:
        let suffix = '';
        if (files.length == 0) {
            return;
        }
        if (files.length > 1) {
            suffix = ' + '+files.length+' others';
        }
        document.getElementById('file-name-title').innerHTML = "File: " + files[0].name + suffix

        // Parse texts:
        graphFromTexFiles(files);

    });
}


function setupExampleLoader() {
    // Set up example loader:
    document.getElementById('load-example-btn').addEventListener('click', async function() {
        const texText = await loadExampleTexString();
        graphFromTexString(texText)
        .then((d) => {
            const graph = d['graph'];
            network = visor.createChart("svgcontainer",  window.innerWidth, window.innerHeight, graph);
        })
        .catch(function(e) {
            console.log("Failed creating a graph from the data", e)
        });
    });
}


async function loadExampleTexString() {
    const example_url = "https://raw.githubusercontent.com/PebbleBonk/pytextree/master/examples/lorem.tex"
    const response = await fetch(example_url);
    return response.text().then((txt) => {return txt});
}


async function loadTexProject2String(files, main_file_name='main.tex') {
    var text = "";
    let main_tex_file = null;
    // Try to get the wanted file from the provided:
    for (var file of files) {
        if (file.name.search(main_file_name) != -1) {
            main_tex_file = file;
            break;
        }
    }
    if (main_tex_file == null) {
        console.log("Did not find file: "+main_file_name);
        return '';
    }

    // Iterate lines, recursively load the needed includes:
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = function(evt){
            resolve(evt.target.result);
        };
        reader.readAsText(main_tex_file);
        reader.onerror = reject;
    }).then(async function(data) {
        // By lines
        var lines = data.split('\n');
        for(var l = 0; l < lines.length; l++){
            var line = lines[l]
            text += line+'\n';
            let m = line.match(/\\include\{\s*([\s\w\.\-\:]*)\s*\}/);
            if (m != null) {
                text += await loadTexProject2String(files, m[1]+'.tex');
            }
        }
        return text;

    }).catch(function(err) {
        console.log(err)
    });
}
