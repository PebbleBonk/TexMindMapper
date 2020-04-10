from flask import Flask, jsonify, request, render_template, abort, redirect
import textree as tt
import sys
import re

source_folder = "./"  #"web" # text2mindmap

app = Flask(
    __name__, static_url_path="", static_folder=source_folder,
    template_folder=source_folder
)


@app.route('/api/parse/tex/text', methods=['POST'])
def parse_tex_text():
    tex_text = request.json.get('tex', '')
    tex_tree = tt.parse_tex_to_tree(tex_text)
    graph = tex_tree.to_graph()

    return jsonify({'graph': graph}), 200


@app.route('/')
def app_used_splash():
    # return render_template('web/index.html'), 200
    return render_template('index.html'), 200


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "local":
        app.run(host="0.0.0.0", debug=True)
    else:
        app.run()
