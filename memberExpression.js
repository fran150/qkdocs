
function processMemberExpression(node, rootName) {
    var name;

    if (rootName) {
        name = rootName;
    } else {
        name = "";
    }

    if (node.object.type == "ThisExpression") {
        name += "this";
    }

    if (node.object.type == "Identifier") {
        name += node.object.name;
    }

    if (node.object.type == "MemberExpression") {
        name += processMemberExpression(node.object);
    }

    if (node.property.type == "Identifier") {
        name += "." + node.property.name;
    }

    return name;
}

module.exports = processMemberExpression;
