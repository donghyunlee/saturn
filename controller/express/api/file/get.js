'use strict';
const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get("/", function (req, res) {
    let {read_path} = req.query;

    let WORKSPACE_PATH = path.resolve(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);

    if (!fs.existsSync(WORKSPACE_PATH)) {
        res.send([]);
        return;
    }

    if (read_path) {
        read_path = JSON.parse(read_path);
        for (let i = 0; i < read_path.length; i++)
            WORKSPACE_PATH = path.resolve(WORKSPACE_PATH, read_path[i]);
    }

    let dirs = fs.readdirSync(WORKSPACE_PATH);
    let ignores = {'node_modules': true, 'package.json': true, '.git': true, '.idea': true};
    let projectList = {};
    for (let i = 0; i < dirs.length; i++) {
        if (ignores[dirs[i]]) continue;
        if (dirs[i].indexOf('.') == 0) continue;
        let info = projectList[dirs[i]] = {};
        info.type = fs.lstatSync(path.resolve(WORKSPACE_PATH, dirs[i])).isDirectory() ? 'folder' : 'file';
        info.path = path.resolve(WORKSPACE_PATH, dirs[i]);
        info.name = dirs[i];
    }

    let result = [];
    for (let key in projectList)
        result.push(projectList[key]);
    res.send(result);
});

module.exports = router;