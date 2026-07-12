var http = require("http");
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

var port = process.env.PORT || 5173;
var root = __dirname;
var syncScript = path.join(root, "tools", "sync_videos.py");
var pythonCandidates = [
  "C:\\Users\\123pr\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe",
  "python"
];

var types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

http.createServer(function (request, response) {
  var requestPath = decodeURIComponent(request.url.split("?")[0]);
  if (requestPath === "/data/videos.json") {
    syncVideos();
  }
  var filePath = path.join(root, requestPath === "/" ? "index.html" : requestPath);

  if (filePath.indexOf(root) !== 0) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, function (error, content) {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  });
}).listen(port, "127.0.0.1", function () {
  console.log("DSA Learning Portal running at http://127.0.0.1:" + port);
});

function syncVideos() {
  if (!fs.existsSync(syncScript)) {
    return;
  }

  for (var i = 0; i < pythonCandidates.length; i += 1) {
    var result = childProcess.spawnSync(pythonCandidates[i], [syncScript], {
      cwd: root,
      windowsHide: true,
      stdio: "ignore"
    });
    if (!result.error && result.status === 0) {
      return;
    }
  }
}
