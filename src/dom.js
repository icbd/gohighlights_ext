function minCommonParentNode(node1, node2) {
    let n1 = node1;
    let n2 = node2;
    let ancestor1 = [n1];
    let ancestor2 = [n2];

    while (true) {
        let commonItems = ancestor1.filter(v => ancestor2.includes(v));
        if (commonItems.length > 0) {
            return commonItems[0];
        }

        if (n1 && n1.parentNode) {
            n1 = n1.parentNode;
            ancestor1.push(n1);
        }
        if (n2 && n2.parentNode) {
            n2 = n2.parentNode;
            ancestor2.push(n2);
        }
    }
}

/**
 * Find the smallest common root node of startTextNode and endTextNode,
 * then start the DFS from this root node,
 * and finally filter only the no blank text node.
 *
 * @param startTextNode
 * @param endTextNode
 * @returns {[]}
 */
function dfsTextNodes(startTextNode, endTextNode) {
    const dfsRoot = minCommonParentNode(startTextNode, endTextNode);
    let nodes = filterTextNodes(dfsNodes(dfsRoot));

    const startIndex = nodes.indexOf(startTextNode);
    const endIndex = nodes.lastIndexOf(endTextNode);
    return nodes.slice(startIndex, endIndex + 1);
}

/**
 * Pure DFS tool
 * @param dfsRootNode
 * @returns {*[]}
 */
function dfsNodes(dfsRootNode) {
    const nodes = [];
    const stack = [dfsRootNode];

    while (stack.length > 0) {
        const item = stack.pop();
        const childNodesCount = item.childNodes.length;
        nodes.push(item);
        for (let i = childNodesCount - 1; i >= 0; i--) {
            stack.push(item.childNodes[i]);
        }
    }
    return nodes;
}

function filterTextNodes(nodes) {
    return nodes.filter(item =>
        item.nodeType === Node.TEXT_NODE
        && !item.hasChildNodes()
        && item.textContent.trim() !== ""
    );
}

// /**
//  * Iterator collect nodes from startTextNode to endTextNode, return node list.
//  *
//  * @param startTextNode
//  * @param endTextNode
//  */
// function iteratorCollectNodes(startTextNode, endTextNode) {
//     const rootNode = minCommonParentNode(startTextNode, endTextNode);
//     const iterator = document.createNodeIterator(
//         rootNode,
//         NodeFilter.SHOW_TEXT,
//         {
//             acceptNode: function (node) {
//                 if (node.nodeType === Node.TEXT_NODE && !node.hasChildNodes() && node.textContent.trim() !== "") {
//                     return NodeFilter.FILTER_ACCEPT;
//                 }
//             }
//         }
//     );
//
//     const textNodes = [];
//     while (true) {
//         const node = iterator.nextNode();
//         if (node) {
//             textNodes.push(node);
//         } else {
//             break;
//         }
//     }
//     return textNodes;
// }