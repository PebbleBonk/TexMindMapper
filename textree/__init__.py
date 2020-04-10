from textree.node import TNode, TEnv
from collections import defaultdict
import numpy as np
import re
import os


def find_sections(text):
    """ Returns a dictionary of found sections and their limits
    """
    ret = []
    sections = [
        'document', 'part', 'chapter',
        'section', 'subsection', 'subsubsection',
        'paragraph','subparagraph'
    ]
    for tag in sections:
        for m in re.finditer(r'\\'+tag+r'\s*\{([\.\w\s]*)\}', text):
            ret.append(TNode(m.group(1), tag, m.start()))

    # Match the ends for the sections:
    ret = sorted(ret)
    for i in range(len(ret)-1):
        for j in range(i+1, len(ret)):
            if sections.index(ret[j].tag) <= sections.index(ret[i].tag):
                ret[i].te = ret[j].ts-1
                break

    return ret


def find_environments(text):
    """ Returns a dictionary of found environments and their limits
    """
    # Find the beginnings and the ends:
    tags, ret = defaultdict(lambda: {'b':[], 'e':[]}), []
    for m in re.finditer(r'\\begin\s*\{([\.\w\s]*)\}', text):
        tags[m.group(1)]['b'].append(m.start())
    for m in re.finditer(r'\\end\s*\{([\.\w\s]*)\}', text):
        tags[m.group(1)]['e'].append(m.end())

    # Match each beginning with an end:
    for tag, be in tags.items():
        # Create a list where every node is sorted
        bs = sorted(be['b'])
        es = sorted(be['e'])

        # Pure magic:
        b_arr = np.tile(np.asarray([bs]), (len(bs), 1))
        e_arr = np.transpose(np.asarray([es]))
        dists = np.abs(np.clip(b_arr-e_arr, None, 0)).astype(np.float)
        dists[dists==0] = np.nan
        for i in range(len(bs)):
            k = np.nanargmin(dists[i])
            ret.append(TEnv(tag, bs[k], es[i]))
            dists[:,k] = np.nan
    return ret


def parse_tex_to_tree(text):
    secs = find_sections(text)
    envs = find_environments(text)

    # Create a single document from the nodes, with shild parent relations
    pieces = sorted(secs+envs)

    # The base node which contains the entire document:
    doc = [TNode('Root', 'Root', 0, len(text))]
    doc[0].id = '$'
    for i, p in enumerate(pieces):
        # Assign a unique ID for the nodes:
        p.id = f'n{i}'
        for d in range(len(doc)-1,-1,-1):
            if p in doc[d]:
                # HACK: if we have an appendix, set the parent to be the doc:
                if isinstance(p, TEnv) and p.tag == 'appendices':
                    p.parent = doc[1]
                else:
                    p.parent = doc[d]
                # HACK: fix the missing end:
                if p.te == -1:
                    # HACK: if parent is Tenv, exclude the end tag (\end{...})
                    if isinstance(doc[d], TEnv):
                        p.te = doc[d].te - 7 -len(doc[d].tag)
                    else:
                        p.te = doc[d].te-1
                break
        doc.append(p)


    # Find content limits for each node:
    # e.g. exclude the contents of children
    # Use the fact that children are in order and mututally exclusive:
    for n in doc:
        contents = []
        # Remove the content of the children:
        cs = n.ts
        for c in n.children:

            # Content before the child content:
            if cs < c.ts:
                contents.append((cs, c.ts))
            cs = c.te

        # Finally, get the end content if exists:
        if cs < n.te -1:
            contents.append((cs, n.te))

        n.contents = contents

    # Finally parse the data inside the content:
    for d in doc:
        d.parse_contents(text)
    # return the tree:
    return doc[0]


def open_tex_project(main_tex_file):
    """ Solve the issue of plopping filenames and includes
    """

    text = ''
    with open(main_tex_file, 'r') as f:
        for line in f:
            text += line

            # Check if we need to include data from another file:
            m = re.search(r'\\include\{\s*([\s\w\.\-\:]*)\s*\}', line)
            if m is not None:
                d = os.path.dirname(f.name)
                incl_file = os.path.join(d, m.group(1)+'.tex')
                print("Loaded:", incl_file)
                # Add the contents of that file:
                text += open_tex_project(incl_file)
    return text