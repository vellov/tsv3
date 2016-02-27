/**
 * Created by vellovaherpuu on 24/01/16.
 */
var jwt                 = require('jsonwebtoken');
var config              = require('./modules/config');
var exports = module.exports = { };

exports.verifyToken = function(token, callback){
    jwt.verify(token.split(" ")[1], config.secretToken, callback);
};

// Original code https://github.com/William17/list-to-tree-lite
exports.listToTree = function(data, options) {
    options = options || {};
    var ID_KEY = options.idKey || 'id';
    var PARENT_KEY = options.parentKey || 'parent';
    var CHILDREN_KEY = options.childrenKey || 'children';

    var tree = [], childrenOf = {};
    var item, id, parentId;

    for(var i = 0, length = data.length; i < length; i++) {
        item = data[i];
        id = item[ID_KEY];
        parentId = item[PARENT_KEY] || 0;
        // every item may have children
        childrenOf[id] = childrenOf[id] || [];
        // init its children
        item[CHILDREN_KEY] = childrenOf[id];
        if (parentId != 0) {
            // init its parent's children object
            childrenOf[parentId] = childrenOf[parentId] || [];
            // push it into its parent's children object
            childrenOf[parentId].push(item);
        } else {
            tree.push(item);
        }
    }

    return tree;
};